export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">FlowFund</h3>
            <p className="text-gray-400 text-sm">
              Smart charity & donation platform powered by blockchain technology for transparent and automated giving.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/projects" className="text-gray-400 hover:text-white">
                  Browse Projects
                </a>
              </li>
              <li>
                <a href="/donate" className="text-gray-400 hover:text-white">
                  Make a Donation
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-white">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Technology</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Ethereum Blockchain</li>
              <li>MNEE Stablecoin</li>
              <li>Smart Contracts</li>
              <li>Web3 Integration</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 FlowFund. Built for transparent charity donations.</p>
        </div>
      </div>
    </footer>
  );
}
