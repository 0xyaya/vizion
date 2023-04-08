const Footer = () => {
  return (
    <div className="bg-[#000514] border-t py-16">
      <div className="container flex flex-col items-center justify-between mx-auto space-y-16 px-6 md:flex-row md:space-y-0">
        <div className="flex flex-col items-center justify-between space-y-8 text-lg font-light md:flex-row md:space-y-0 md:space-x-14 text-gray-300">
          <a href="#" className="uppercase hover:text-red-500">
            WHITEPAPER
          </a>
          <a href="#" className="uppercase hover:text-red-500">
            FAQ
          </a>
          <a href="#" className="uppercase hover:text-red-500">
            DISCORD
          </a>
          <a href="#" className="uppercase hover:text-red-500">
            TWITTER
          </a>
        </div>
      </div>
    </div>
  )
}

export default Footer
