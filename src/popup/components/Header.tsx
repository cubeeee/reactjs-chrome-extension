
import React from 'react'

function Header() {
    return (
      <header className="w-[420px] py-3 bg-orange-50">
      <div className="flex flex-col gap-2 items-center">
        <div className="w-auto h-10">
          <img alt="Netproxy" className="w-full h-full object-contain" src={'/logo.svg'} />
        </div>
        <div className="text-lg text-center px-2 font-semibold">
          Proxy dân cư Việt Nam đảm bảo chất lượng{" "}
        </div>
      </div>
    </header>
    )
}

export default Header