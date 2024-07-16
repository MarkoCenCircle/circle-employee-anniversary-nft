import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import {Pixelify_Sans} from "next/font/google";
import Image from "next/image";
import {formatOrdinals} from "@/components/ordinals";

interface Props {
  open: boolean
  onClose: () => void
  tokenId?: number;
}

const pixelSans = Pixelify_Sans({ subsets: ['latin'] });

export const NftDetailsModal: React.FC<Props> = ({ open, onClose, tokenId }) => {
  if (tokenId === undefined) {
    return null
  }

  const ordinals = formatOrdinals(tokenId)
  const title = tokenId === 0 ? `Welcome to Circle!` : `Happy ${ordinals} Circleversary!`

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
            className="min-h-full relative transform overflow-hidden rounded-lg bg-[#29233b] px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-3xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="flex gap-5 flex-col md:flex-row">
              <div>
                <Image
                  className='mx-auto'
                  src={`/nft-pics/${tokenId}.png`} width={300} height={300} alt={title}/>
              </div>
              <div className="mt-2 flex flex-col gap-4">
                <DialogTitle as="h3" className="text-2xl leading-6">{title}</DialogTitle>
                <div>
                  <p className="text-gray-400 break-words">
                    Address: 0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5
                  </p>
                  <p className="text-gray-400">
                    Received on: 07/15/2022
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
