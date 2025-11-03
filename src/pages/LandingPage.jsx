import { Link } from "react-router-dom";
import "./LandingPage.css";
import { useEffect } from "react";

const LandingPage = () => {
  useEffect(() => {
    // Add particle effect animation
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 85 + "vw";
      document.querySelector(".particle-container").appendChild(particle);
      setTimeout(() => particle.remove(), 5000);
    };

    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="bg-black min-h-screen overflow-hidden">
      <div className="particle-container absolute inset-0" />

      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link to="/login" className="text-sm font-semibold text-gray-100 hover:text-blue-500">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-polygon" aria-hidden="true">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          ></div>
        </div>
        {/* New floating elements */}
        <div className="absolute inset-0 z-0">
          <div className="floating-element left-20 top-40" />
          <div className="floating-element right-20 top-60" />
          <div className="floating-element left-1/4 bottom-40" />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm text-gray-300 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Check out our Instagram!{" "}
              <a href="https://www.instagram.com/blc.petra/" className="font-semibold text-white-600 hover:text-blue-500 underline">
                <span className="absolute inset-0" aria-hidden="true"></span>@blcpetra <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-100 sm:text-7xl">BLC Shipping</h1>
            <p className="mt-8 text-lg font-medium text-gray-400 sm:text-xl">Interactive web-based simulation that transforms complex maritime container logistics into an engaging learning experience</p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Link
                to={"/demo"}
                className="rounded-md bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 animated-border-red flex items-center gap-2"
              >
                Demo Tutorial →
              </Link>
              <Link
                to={"/login"}
                className="rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 animated-border-blue flex items-center gap-2"
              >
                Log in →
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] animate-polygon" aria-hidden="true">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
