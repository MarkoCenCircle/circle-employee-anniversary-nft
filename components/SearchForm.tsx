import {type InferType, object, string} from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useRouter} from "next/router";
import {useState} from "react";

export const searchSchema = object().shape({
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

export type SearchFormValues = InferType<typeof searchSchema>

export const SearchForm = () => {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const {register, handleSubmit, formState} = useForm<SearchFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: yupResolver(searchSchema),
  })

  const onSubmit = async (values: SearchFormValues) => {
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
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
    </div>
  </div>
}
