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
  walletAddress: string;
  nfts: NftResponse[]
}

const User: React.FC<Props> = ({ firstName, joinDate, walletAddress, nfts }) => {
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

  const startTime = new Date(joinDate ? joinDate * 1000 : Date.now())
  const nextTime = new Date(joinDate ? joinDate * 1000 : Date.now())
  nextTime.setFullYear(nextTime.getFullYear() + 1)

  const sortedNfts = nfts ? [...nfts.sort((a,b) => a.tokenId > b.tokenId ? 1 : -1)] : []

  const imageUrl = `https://circle-employee-anniversary-nft.vercel.app/nft-pics/${sortedNfts[sortedNfts.length - 1]?.tokenId ?? 1}.png`

  const title = 'Check my Circle anniversary NFTs!'
  const seoProps: NextSeoProps = {
    title,
    themeColor: '#29233b',
    nofollow: true,
    noindex: true,
    canonical: url,
    description,
    openGraph: {
      title,
      url,
      type: 'website',
      description,
      siteName: 'Circle Anniversary NFTs',
      locale: 'en_US',
      images: [{
        url: imageUrl,
        width: 500,
        height: 500,
        alt: sortedNfts[sortedNfts.length - 1]?.description ?? 'Sign up to receive NFTs on your Circle anniversaries!',
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

  const onRefresh = () => window.location.reload()

  return <>
    <NextSeo {...seoProps} />
    <div className='text-2xl fixed w-full py-2 px-6 flex items-center justify-end'>
      <Link href='/'>Home</Link>
    </div>
    {sortedNfts.length <= 0 && <div className='flex min-h-screen flex-col items-center py-36 px-6 gap-6'>
      <h1 className='text-3xl'>Hold tight, we are minting your anniversary NFTs...</h1>
      <button onClick={onRefresh} className="flex justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-md font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Refresh</button>
    </div>}

    {sortedNfts.length > 0 && <div className={`flex min-h-screen flex-col items-center py-24 px-6`}>
      <div className='flex flex-col gap-2 w-full lg:w-3/5'>
        <h1 className="text-6xl">{`Happy Circleversaries, ${firstName}!`}</h1>
        <h2 className="text-2xl">You joined Circle on {startTime.toLocaleDateString()}, and you'll receive your next
          anniversary NFT on {nextTime.toLocaleDateString()}. Congrats!
        </h2>
        <h2 className="text-2xl">Wallet: <Link className='underline' target='_blank' href={`https://polygonscan.com/address/${walletAddress}`}>{walletAddress.substring(0, 7)}...{walletAddress.substring(37)}</Link>. Click on image to see the NFT details</h2>
        <div className="text-2xl flex items-center gap-3">
          <label>Share on</label>
          <Link href={linkedInUrl} target='_blank' rel="noopener noreferrer">
            <Icon icon={faLinkedinIn} width={24} color='#0077B5'/>
          </Link>
          <Link href={twitterUrl} target='_blank' rel="noopener noreferrer">
            <Icon icon={faTwitter} width={24} color='#1DA1F2'/>
          </Link>
          <Link href={facebookUrl} target='_blank' rel="noopener noreferrer">
            <Icon icon={faFacebook} width={24} color='#1877F2'/>
          </Link>
        </div>
      </div>
      <div className='container mx-auto lg:px-36'>
        <div className='mt-12 grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full'>
          {
            (sortedNfts).map((nft) => {
              return <div className='mb-10 w-36 h-36 md:w-52 md:h-52 xl:w-60 xl:h-60 relative mx-auto'
                          key={nft.title}>
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
    }
    <NftDetailsModal open={modalOpen} onClose={onModalClose} token={token}/>
  </>
}

export const getServerSideProps: GetServerSideProps = async ({query}) => {
  const {id } = query as { id: string }
  const profile = await getUserProfile({
    userId: Number(id)
  })

  return {
    props: {
      firstName: capitalize(profile.firstName),
      joinDate: profile.joinDate,
      walletAddress: profile.walletAddress,
      nfts: profile.nfts
    }
  }
}

export default User
