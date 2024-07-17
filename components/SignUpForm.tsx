import { object, string } from 'yup'
import type { InferType } from 'yup'
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {SignUpRequest, SignUpResponse} from "@/models/signUp";
import {useRouter} from "next/router";
import {useState} from "react";

const signUpSchema = object().shape({
  email: string()
    .email('Please enter your circle email.')
    .trim()
    .required('Please enter your circle email.')
    .test(
      'is-circle-email',
      'Please enter a valid circle email',
      email => email.endsWith('circle.com')
    ),
  startDate: string()
    .trim()
    .required('Start date is required.')
    .test(
      'is-start-date',
      'Please enter a valid start date',
      startDate => {
        try {
          const timestamp = Date.parse(startDate)
          return !isNaN(timestamp)
        } catch {
          return false
        }
    }
    ),
})

type SignUpFormValues = InferType<typeof signUpSchema>

export const SignUpForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState} = useForm<SignUpFormValues>({
    defaultValues: {
      email: '',
      startDate: ''
    },
    resolver: yupResolver(signUpSchema),
  })

  const onSubmit = async (values: SignUpFormValues) => {
    const joinDate = new Date(values.startDate)
    joinDate.setHours(0)
    joinDate.setSeconds(0)
    joinDate.setMilliseconds(0)

    try {
      if (loading) {
        return
      }

      setLoading(true)
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const res = await fetch('/api/signup',{
        method: 'POST',
        body: JSON.stringify({
          email: values.email,
          joinDate: joinDate.getTime()
        } as SignUpRequest),
        headers
      })

      const data = await res.json() as SignUpResponse

      void router.push({
        pathname: `/users/[id]`,
        query: { id: data. userId }
      })
    } catch(ex) {
      console.error(ex)
    }
    finally {
      setLoading(false)
    }
  }

  return <div className="flex min-h-full flex-1 flex-col justify-center w-full">
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-md font-medium leading-6 text-white">
            Your Circle Email
          </label>
          <div className="mt-2 flex flex-col gap-1">
            <input
              id="email"
              autoComplete="email"
              {...register('email', { required: true })}
              className="block w-full rounded-md border-0 bg-white/5 p-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-md sm:leading-6"
            />
            {formState.errors.email && <label className="text-red-400">{formState.errors.email.message}</label>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="start-date" className="block text-md font-medium leading-6 text-white">
              Start Date
            </label>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <input
              id="start-date"
              type='date'
              {...register('startDate', { required: true })}
              className="block text-md w-full rounded-md border-0 bg-white/5 p-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:leading-6"
            />
            {formState.errors.startDate && <label className="text-red-400">{formState.errors.startDate.message}</label>}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="disabled:opacity-70 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-md font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {loading ? 'Loading...' : 'Sign up'}
          </button>
        </div>
      </form>
    </div>
  </div>
}
