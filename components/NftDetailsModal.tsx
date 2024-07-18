import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import {VT323} from "next/font/google";
import Image from "next/image";
import {NftResponse} from "@/models/userProfile";
import Link from "next/link";

interface Props {
  open: boolean
  onClose: () => void
  token?: NftResponse;
}

const pixelSans = VT323({ weight: ['400'], subsets: ['latin'] });

export const NftDetailsModal: React.FC<Props> = ({ open, onClose, token }) => {
  if (token === undefined) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} className={`relative z-10 ${pixelSans.className}`}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
            transition
            className="min-h-full relative transform overflow-hidden rounded-lg bg-[#29233b] px-4 pb-6 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-3xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="flex gap-5 flex-col md:flex-row">
              <div className='basis-3/4'>
                <Image
                  className='mx-auto'
                  src={`/nft-pics/${token.tokenId}.png`} width={300} height={300} alt={token.title ?? ''}/>
              </div>
              <div className="mt-2 flex flex-col gap-6">
                <DialogTitle as="h3" className="text-4xl leading-6">{token.title}</DialogTitle>
                <div className='flex flex-col gap-4'>
                  <p className="text-gray-400 text-2xl">
                    {token.description}
                  </p>
                  <p className="text-gray-400 break-words text-2xl">
                    NFT Contract: <Link className='underline' href={`https://polygonscan.com/address/${token.address}`} target='_blank'
                                   rel="noopener noreferrer">{token.address}</Link>
                  </p>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
