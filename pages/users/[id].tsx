import Image from "next/image";
import {FontAwesomeIcon, FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome'
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
import {TopBar} from "@/components/TopBar";
import {SearchForm} from "@/components/SearchForm";
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import {RefreshNftsModal} from "@/components/RefreshNftsModal";

interface Props {
  name: string;
  joinDate: number;
  walletAddress: string;
  nfts: NftResponse[]
}

const User: React.FC<Props> = ({ name, joinDate, walletAddress, nfts }) => {
  const router = useRouter()
  const url = `https://circle-employee-anniversary-nft.vercel.app${router.asPath}`
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURI(url)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}`
  const linkedInUrl = `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURI(url)}`

  const [modalOpen, setModalOpen] = useState(false)
  const [refreshModalOpen, setRefreshModalOpen] = useState(false)
  const [token, setToken] = useState<NftResponse>()

  const onModalClose = useCallback(() => {
    setModalOpen(false)
  }, [])

  const onRefreshModalClose = useCallback(() => {
    setRefreshModalOpen(false)
  }, [])

  const onImageClick = useCallback((nft: NftResponse) => {
    setToken(nft)
    setModalOpen(true)
  }, [])

  const onNftRefreshClick = useCallback(() => {
    setRefreshModalOpen(true)
  }, [])

  const description = `Happy Circleversaries, ${name}!`

  const restBlocks = Array(12 - nfts.length).fill(1)

  const startTime = new Date(joinDate ? joinDate * 1000 : Date.now())
  const nextTime = new Date(joinDate ? joinDate * 1000 : Date.now())
  nextTime.setFullYear(new Date().getFullYear())
  if (nextTime < new Date()) {
    nextTime.setFullYear(new Date().getFullYear() + 1)
  } 

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
    <TopBar/>
    <div className='flex min-h-screen flex-col items-center py-24 px-6 gap-6'>
      <div className='flex flex-col gap-2 w-full lg:w-3/5'>
        <h1 className="text-5xl">Explore your coworker&apos;s NFTs!</h1>
        <SearchForm/>
      </div>
      {sortedNfts.length <= 0 && <>
        <h1 className='text-3xl'>Hold tight, we are minting your anniversary NFTs...</h1>
        <button onClick={onRefresh}
                className="flex justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-md font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Refresh
        </button>
      </>}
      {sortedNfts.length > 0 && <>
        <div className='flex flex-col xl:flex-row justify-between xl:items-center w-full lg:w-3/5 xl:px-6'>
          <h1 className="text-5xl">{name}</h1>
          <div className='flex flex-col md:flex-row md:items-center xl:justify-end gap-2 md:gap-16'>
            <div className='flex flex-col'>
              <Link className='text-2xl underline opacity-60 leading-7' target='_blank'
                    href={`https://polygonscan.com/address/${walletAddress}`}>{walletAddress.substring(0, 4)}...{walletAddress.substring(39)}</Link>
              <span className='text-2xl leading-7'>Wallet</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-2xl opacity-60 leading-7'>{sortedNfts.length}</span>
              <span onClick={onNftRefreshClick} className='text-2xl leading-7 flex items-center gap-1 cursor-pointer' title='Refresh NFTs'>NFTs <FontAwesomeIcon icon={faRefresh} width={15} /></span>
            </div>

            <div className='flex flex-col'>
              <span className='text-2xl opacity-60 leading-7'>{new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }).format(nextTime)}</span>
              <span className='text-2xl leading-7'>Next Circleversary</span>
            </div>

            <div className='flex flex-col'>
              <div className='text-2xl opacity-60 flex items-center gap-3 mt-1'>
                <Link href={linkedInUrl} target='_blank' rel="noopener noreferrer">
                  <Icon icon={faLinkedinIn} width={20} color='#0077B5'/>
                </Link>
                <Link href={twitterUrl} target='_blank' rel="noopener noreferrer">
                  <Icon icon={faTwitter} width={20} color='#1DA1F2'/>
                </Link>
                <Link href={facebookUrl} target='_blank' rel="noopener noreferrer">
                  <Icon icon={faFacebook} width={20} color='#1877F2'/>
                </Link>
              </div>
              <span className='text-2xl leading-12'>Share on</span>
            </div>
          </div>
        </div>
        <div className='mt-2 w-full lg:w-3/5 grid grid-flow-row grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full gap-0'>
          {
            (sortedNfts).map((nft) => {
              return <div className='mb-10 w-40 h-40 md:w-52 md:h-52 xl:w-60 xl:h-60 relative mx-auto'
                          key={nft.title}>
                <Image
                  onClick={() => onImageClick(nft)}
                  className='hover:scale-105 transition-transform cursor-pointer'
                  src={`/nft-pics/${nft.tokenId}.png`} fill alt={nft.description ?? ''}
                />
              </div>
            })
          }
          <div className='w-40 h-40 md:w-52 md:h-52 xl:w-60 xl:h-60 relative mx-auto'>
            <div className='p-6 w-full h-full border rounded-2xl border-amber-100 border-dashed flex flex-col items-start justify-center'>
              <span className='text-xl text-gray-400'>Coming Soon</span>
              <span className='text-xl text-gray-400'>Your next NFT will be minted {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }).format(nextTime)}</span>
            </div>
          </div>
        </div>
      </>}
    </div>

    <NftDetailsModal open={modalOpen} onClose={onModalClose} token={token}/>
    <RefreshNftsModal open={refreshModalOpen} onClose={onRefreshModalClose} />
  </>
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
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
      name: profile.name,
      joinDate: profile.joinDate,
      walletAddress: profile.walletAddress,
      nfts: profile.nfts
    }
  }
}

export default User
