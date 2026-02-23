const GITHUB_URL = "https://github.com/adamatan/watermark";

export function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <a
        href="#/"
        className="mb-6 text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </a>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">About Watermark</h2>

      <p className="text-gray-700 mb-6">
        We're often required to send photographs of sensitive documents to AirBnBs, hotels,
        car rental agencies, and even accountants during tax season. If any of these get leaked,
        they can be used for identity theft. Adding a visible watermark makes it harder (though
        not impossible) for fraudsters to reuse your documents. Watermark is free and open
        source, and all processing happens locally in your browser. Your files are never
        uploaded anywhere.
      </p>

      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        View source on GitHub
      </a>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Before</p>
          <img
            src={`${import.meta.env.BASE_URL}sample.png`}
            alt="Original image before watermarking"
            className="rounded-lg border border-gray-200 w-full"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">After</p>
          <img
            src={`${import.meta.env.BASE_URL}watermark-for-about-page.jpg`}
            alt="Image after watermarking"
            className="rounded-lg border border-gray-200 w-full"
          />
        </div>
      </div>
    </div>
  );
}
