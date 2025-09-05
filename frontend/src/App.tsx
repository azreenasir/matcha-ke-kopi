import { useEffect, useState } from "react";

function App() {
  const [matchaVote, setMatchaVote] = useState(0);
  const [kopiVote, setKopiVote] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalVote = matchaVote + kopiVote;
  const matchaPercent = totalVote > 0 ? (matchaVote / totalVote) * 100 : 0;
  const kopiPercent = totalVote > 0 ? (kopiVote / totalVote) * 100 : 0;

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Fetch results from backend
  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_BASE}/results`);
      const data = await res.json();
      setMatchaVote(data.matchaVotes);
      setKopiVote(data.kopiVotes);
    } catch (err) {
      console.error("Error fetching results:", err);
    }
  };

  // Cast vote
  const castVote = async (choice: "matcha" | "kopi") => {
    try {
      setLoading(true);

      // const ipRes = await fetch("https://ipv4.icanhazip.com");
      // const ip = (await ipRes.text()).trim();

      // console.log("Casting vote for:", choice, ip);

      const res = await fetch(`${API_BASE}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message);
      }

      await fetchResults(); // refresh results after voting
    } catch (err) {
      console.error("Error voting:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load results on page load
  useEffect(() => {
    fetchResults();
  }, []);

  const handleShare = () => {
    const shareData = {
      title: "Matcha vs Kopi",
      text: "Vote for your favorite drink!",
      url: window.location.href,
    };

    if (navigator.share) {
      // Native share on mobile
      navigator.share(shareData).catch((err) => console.error(err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert("Link copied to clipboard!");
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-stone-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          🍵 Matcha ke ☕ Kopi?
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Total Vote: <span className="font-semibold">{totalVote}</span>
        </p>

        <hr className="border-gray-300 dark:border-gray-600 my-4" />

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => castVote("matcha")}
            disabled={loading}
            className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-medium text-white shadow hover:bg-green-600 disabled:opacity-50"
          >
            Matcha ({matchaVote})
          </button>
          <button
            onClick={() => castVote("kopi")}
            disabled={loading}
            className="flex-1 rounded-lg bg-stone-600 px-4 py-2 font-medium text-white shadow hover:bg-stone-700 disabled:opacity-50"
          >
            Kopi ({kopiVote})
          </button>
        </div>

        {/* ✅ Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden dark:bg-gray-700">
          {/* Matcha */}
          <div
            className="h-6 bg-green-500 text-xs font-semibold text-white flex items-center justify-center transition-all duration-500 ease-out"
            style={{ width: `${matchaPercent}%` }}
          >
            {matchaPercent > 10 && `${matchaPercent.toFixed(0)}%`}
          </div>

          {/* Kopi */}
          <div
            className="h-6 bg-stone-600 text-xs font-semibold text-white flex items-center justify-center transition-all duration-500 ease-out"
            style={{ width: `${kopiPercent}%` }}
          >
            {kopiPercent > 10 && `${kopiPercent.toFixed(0)}%`}
          </div>
        </div>
      </div>
      {/* Floating Share Button */}
      <button
        onClick={handleShare}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-500 p-4 shadow-lg text-white hover:bg-blue-600 focus:outline-none"
        title="Share this website"
      >
        🔗 Share
      </button>
    </div>
  );
}

export default App;
