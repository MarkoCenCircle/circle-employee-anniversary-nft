import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import {VT323} from "next/font/google";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useState} from "react";
import {SignUpRequest} from "@/models/signUp";
import {type InferType, object, string} from "yup";

interface Props {
  open: boolean
  onClose: () => void
}

const pixelSans = VT323({ weight: ['400'], subsets: ['latin'] });

const emailSchema = object().shape({
  email: string()
    .email('Please enter a circle email.')
    .trim()
    .required('Please enter a circle email.')
    .test(
      'is-circle-email',
      'Please enter a valid circle email',
      email => email.endsWith('circle.com')
    ),
})

type EmailFormValues = InferType<typeof emailSchema>

export const RefreshNftsModal: React.FC<Props> = ({ open, onClose }) => {
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const {reset, register, handleSubmit, formState} = useForm<EmailFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: yupResolver(emailSchema),
  })

  const onSubmit = async (values: EmailFormValues) => {
    try {
      if (loading) {
        return
      }

      setError('')
      setLoading(true)
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const res = await fetch('/api/checkNewNfts',{
        method: 'POST',
        body: JSON.stringify({
          email: values.email,
        } as SignUpRequest),
        headers
      })

      await res.json()

      setEmailSent(true)
    } catch(ex) {
      console.error(ex)
      setError('Not able to send email.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setEmailSent(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} className={`relative z-10 ${pixelSans.className}`}>
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
            <DialogTitle className='text-3xl'>Check New NFTs</DialogTitle>
            {!emailSent && <DialogTitle className='text-xl'>Enter the Circle email associated with this profile to refresh the NFT collection</DialogTitle>}
            {!emailSent && <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="mt-2 flex flex-col gap-1">
                <input
                  id="email"
                  autoComplete="email"
                  placeholder='Enter Circle email'
                  {...register('email', {required: true})}
                  className="block w-full rounded-md border-0 bg-white/5 p-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-xl sm:leading-6"
                />
                {formState.errors.email && <label className="text-red-400">{formState.errors.email.message}</label>}
              </div>
              <div>
                {error}
              </div>
            </form>
            }
            {emailSent && <div className='w-full'>
              <h2 className='text-2xl'>Check your inbox to refresh your NFT collection.</h2>
            </div>}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
