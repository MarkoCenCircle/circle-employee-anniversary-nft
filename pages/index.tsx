import {SignUpForm} from "@/components/SignUpForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className={`flex min-h-screen flex-col items-center py-24 px-12`}>
      <div className='flex items-center flex-col gap-2'>
        <h1 className="text-6xl">Circle Anniversary NFTs</h1>
        <h2 className="text-3xl">Sign up to receive NFTs on your Circle anniversaries!</h2>
      </div>
      <div className='flex items-center flex-col gap-2 w-full'>
        <SignUpForm/>
        <p className="mt-5 text-center text-xl text-gray-400">
          <Link href='/explore' className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
            Explore your coworker&apos;s NFTs!
          </Link>
        </p>
      </div>
    </div>
  );
}
