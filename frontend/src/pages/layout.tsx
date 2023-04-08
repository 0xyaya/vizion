import Header from 'src/components/Header/Header';
import Footer from 'src/components/Footer/Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col mx-auto bg-[#00103D] bg-cover min-h-screen">
      <Header />
      <div className="mt-6 mx-auto w-2/3 min-h-screen">{children}</div>
      <Footer />
    </div>
  );
}
