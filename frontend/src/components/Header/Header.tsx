import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <div className="flex flex-row p-4 justify-between items-center bg-[#000A29] border-b border-white">
      <div className="flex justify-center w-1/4">
        <span className="text-3xl text-white">VIZION</span>
      </div>
      <div className="text-slate-100 text-xl space-x-4 font-light">
        <Link href={'/'} className="hover:text-red-500">
          Gouvernance
        </Link>
        <Link href={'/marketplace'} className="hover:text-red-500">
          Marketplace
        </Link>
        <Link href="/staking" className="hover:text-red-500">
          Staking
        </Link>
      </div>
      <div>
        <ConnectButton />
      </div>
    </div>
  );
};

export default Header;
