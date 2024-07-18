
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {TopBar} from "@/components/TopBar";

export default function RedeemNfts() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = router.query.tok as string
      if (token) {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append('Authorization', `Bearer ${token}`);

        void fetch('/api/redeemNfts',{
          method: 'POST',
          headers
        }).then(res => res.json())
          .then(json => {
            const userId = json.userId as string
            void router.replace(`/users/${userId}`)
          })
          .catch((ex) => { console.error(ex); setError('Can\'t verify the account, please sign up again.')})
      }
    }
  }, [router])

  return (
    <>
      <TopBar />
      <div className={`flex min-h-screen flex-col items-center py-24 px-12`}>
        <div className='flex items-center flex-col gap-2'>
          <h1 className="text-6xl">Circle Anniversary NFTs</h1>
          <h2 className="text-3xl">We are verifying your account...</h2>
          <div className='mt-5'>
            <FontAwesomeIcon className='fa-spin' icon={faSpinner} spinPulse width={30}/>
          </div>
          {error && <label className="text-red-400">{error}</label>}
        </div>
      </div>
    </>
  );
}
