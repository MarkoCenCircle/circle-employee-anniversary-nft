import {type InferType, object, string} from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useRouter} from "next/router";
import {useState} from "react";

const signInSchema = object().shape({
  email: string()
    .email('Please enter your circle email.')
    .trim()
    .required('Please enter your circle email.')
    .test(
      'is-circle-email',
      'Please enter a valid circle email',
      email => email.endsWith('circle.com')
    ),
})

type SignInFormValues = InferType<typeof signInSchema>

export const SignInForm = () => {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const {register, handleSubmit, formState} = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: yupResolver(signInSchema),
  })

  const onSubmit = async (values: SignInFormValues) => {
    try {
      if (loading) {
        return
      }

      setError('')
      setLoading(true)
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const res = await fetch(`/api/users?email=${values.email}`, {
        method: 'GET',
        headers,
      })

      const data = await res.json() as { userId: number }[]

      if (!data || data.length <= 0) {
        setError('No profile found.')
      }

      void router.push(`/users/${data[0].userId}`)
    } catch(ex) {
      console.error(ex)
    } finally {
      setLoading(false)
    }
  }

  return <div className="flex min-h-full flex-1 flex-col justify-center w-full">
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-xl font-medium leading-6 text-white">
            Your Circle Email
          </label>
          <div className="mt-2 flex flex-col gap-1">
            <input
              id="email"
              autoComplete="email"
              {...register('email', {required: true})}
              className="block w-full rounded-md border-0 bg-white/5 p-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-xl sm:leading-6"
            />
            {formState.errors.email && <label className="text-red-400">{formState.errors.email.message}</label>}
          </div>
        </div>

        <div>
          {error}
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="disabled:opacity-70 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-xl font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {loading ? 'Loading...' : 'View my NFTs'}
          </button>
        </div>
      </form>
    </div>
  </div>
}
