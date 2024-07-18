import Image from "next/image";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faFacebook, faTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import Link from "next/link";
import {NextSeo, NextSeoProps} from "next-seo";
import {useRouter} from "next/router";
import {NftDetailsModal} from "@/components/NftDetailsModal";
import {useCallback, useState} from "react";
import {GetServerSideProps} from "next";
import {getUserProfile} from "@/handlers/getUserProfile";
import {NftResponse} from "@/models/userProfile";
import capitalize from 'lodash.capitalize'

interface Props {
  firstName: string;
  joinDate: number;
  nfts: NftResponse[]
}

const User: React.FC<Props> = ({ firstName, joinDate, nfts }) => {
  const router = useRouter()
  const url = `https://circle-employee-anniversary-nft.vercel.app${router.asPath}`
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURI(url)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}`
  const linkedInUrl = `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURI(url)}`

  const [modalOpen, setModalOpen] = useState(false)
  const [token, setToken] = useState<NftResponse>()

  const onModalClose = useCallback(() => {
    setModalOpen(false)
  }, [])

  const onImageClick = useCallback((nft: NftResponse) => {
    setToken(nft)
    setModalOpen(true)
  }, [])

  const description = `Happy Circleversaries, ${firstName}!`

  const restBlocks = Array(12 - nfts.length).fill(1)

  const nextTime = new Date(joinDate ? joinDate * 1000 : Date.now())
  nextTime.setFullYear(nextTime.getFullYear() + 1)

  const sortedNfts = nfts ? [...nfts.sort((a,b) => a.tokenId > a.tokenId ? 1 : -1)] : []

  const imageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/${sortedNfts[sortedNfts.length - 1].tokenId ?? 1}.png`

  const seoProps: NextSeoProps = {
    title: 'Check my Circle anniversary NFTs!',
    themeColor: '#29233b',
    nofollow: true,
    noindex: true,
    canonical: url,
    description,
    openGraph: {
      title: 'Check my Circle anniversary NFTs!',
      url,
      type: 'website',
      description,
      siteName: 'Circle Anniversary NFTs',
      locale: 'en_US',
      images: [{
        url: imageUrl,
        width: 500,
        height: 500,
        alt: 'Sign up to receive NFTs on your Circle anniversaries!',
        type: 'image/png'
      }],
      defaultImageHeight: 500,
      defaultImageWidth: 500,
    },
    twitter: {
      site: url,
      cardType: 'summary_large_image'
    }
  }

  return <>
    <NextSeo {...seoProps} />
    <div className={`flex min-h-screen flex-col items-center py-24 px-6`}>
      <div className='flex flex-col gap-2'>
        <h1 className="text-4xl">{`Happy Circleversaries, ${firstName}!`}</h1>
        <h2 className="text-2xl">Click to see the NFT details, you will receive your next NFT on {nextTime.toDateString()}</h2>
        <div className="text-xl flex items-center gap-3">
          <label>Share on</label>
          <Link href={linkedInUrl} target='_blank' rel="noopener noreferrer">
            <Icon icon={faLinkedinIn} width={24} color='#0077B5' />
          </Link>
          <Link href={twitterUrl} target='_blank' rel="noopener noreferrer">
            <Icon icon={faTwitter} width={24} color='#1DA1F2' />
          </Link>
          <Link href={facebookUrl} target='_blank' rel="noopener noreferrer">
            <Icon icon={faFacebook} width={24} color='#1877F2' />
          </Link>
        </div>
      </div>
      <div className='container mx-auto lg:px-36'>
        <div className='mt-12 grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full'>
          {
            (sortedNfts).map((nft) => {
              return <div className='mb-10 w-36 h-36 md:w-52 md:h-52 xl:w-60 xl:h-60 relative mx-auto'
                          key={nft.tokenId}>
                <Image
                  onClick={() => onImageClick(nft)}
                  className='hover:scale-105 transition-transform cursor-pointer'
                  src={`/nft-pics/${nft.tokenId}.png`} fill alt={nft.description ?? ''}
                />
              </div>
            })
          }
          {
            restBlocks.map((num) => (
              <div className='mb-10 w-36 h-36 md:w-52 md:h-52 xl:w-60 xl:h-60 relative mx-auto'
                   key={num}>
                <div className='w-full h-full border rounded-2xl border-amber-100 border-dashed'></div>
              </div>
              )
            )
          }
        </div>
      </div>
    </div>
    <NftDetailsModal open={modalOpen} onClose={onModalClose} token={token} />
  </>
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query as { id: string }
  const httpWrappedProfile = await getUserProfile({
    userId: Number(id)
  })
  if (!httpWrappedProfile.data) {
    throw new Error("Error fetching user: " + httpWrappedProfile.errMsg)
  }
  const profile = httpWrappedProfile.data;

  return {
    props: {
      firstName: capitalize(profile.firstName),
      joinDate: profile.joinDate,
      nfts: profile.nfts
    }
  }
}

export default User
