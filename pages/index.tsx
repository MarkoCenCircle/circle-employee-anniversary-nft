import { Pixelify_Sans } from "next/font/google";
import {SignUpForm} from "@/components/SignUpForm";
import {useState} from "react";
import {SignInForm} from "@/components/SignInForm";

const pixelSans = Pixelify_Sans({ subsets: ['latin'] });

export default function Home() {
  const [isSignIn, setIsSignIn] = useState(false)

  const onSwitch = () => {
    setIsSignIn(flag => !flag)
  }

  return (
    <div  className={`flex min-h-screen flex-col items-center py-24 px-12 ${pixelSans.className}`}>
      <header className='flex items-center flex-col gap-2'>
        <h1 className="text-5xl">Circle Anniversary NFTs</h1>
        <h2 className="text-2xl">Sign up to receive NFTs on your Circle anniversaries!</h2>
      </header>
      <main className='flex items-center flex-col gap-2 w-full'>
        {!isSignIn && <SignUpForm/>}
        {isSignIn && <SignInForm/>}
        <p className="mt-5 text-center text-md text-gray-400">
          {!isSignIn ? 'Already sign up?' : 'Haven\'t sign up?'}{' '}
          <button onClick={onSwitch} className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
            {!isSignIn ? 'View your NFTs here' : 'Sign up here'}
          </button>
        </p>
      </main>
    </div>
  );
}
