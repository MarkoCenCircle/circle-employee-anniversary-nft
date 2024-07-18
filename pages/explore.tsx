import {TopBar} from "@/components/TopBar";
import {SearchForm} from "@/components/SearchForm";

const Explore: React.FC = () => {
  return <>
    <TopBar />
    <div className={`flex min-h-screen flex-col items-center py-24 px-6`}>
      <div className='flex flex-col gap-2 w-full lg:w-3/5'>
        <h1 className="text-5xl">Explore your coworker&apos;s NFTs!</h1>
        <SearchForm />
      </div>
    </div>
  </>
}

export default Explore
