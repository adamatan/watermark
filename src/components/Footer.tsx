const GITHUB_URL = "https://github.com/adamatan/watermark";

export function Footer() {
  return (
    <footer className="mt-12 pb-6 text-center text-xs text-gray-400 space-y-1">
      <p>
        Your images never leave your browser. All processing happens locally on
        your device.
      </p>
      <p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600 transition-colors"
        >
          View source on GitHub
        </a>{" "}
        &mdash; MIT licensed, no tracking.
      </p>
    </footer>
  );
}
