import Link from "next/link";

export const TopBar = () => {
  return <>
    <div className='text-2xl fixed w-full py-2 px-6 flex items-center justify-end'>
      <Link href='/'>Sign Up</Link>
    </div>
  </>
}
