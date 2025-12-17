import { useState, useEffect } from "react";
import { PointsDisplay } from "./components/PointsDisplay";
import { ActivityDisplay } from "./components/ActivityDisplay";

function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setAuthLoading(false);
      })
      .catch(() => setAuthLoading(false));
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-700 font-medium">Loading WhyPals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <header className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/whypals-logo.png" alt="WhyPals" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-teal-600" style={{ fontFamily: "Fredoka, sans-serif" }}>
              WhyPals
            </h1>
          </div>
          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <PointsDisplay />
                <span className="text-gray-700">{user.firstName || user.email}</span>
              </>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Sign In
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h2
            className="text-4xl font-bold text-teal-700 mb-4"
            style={{ fontFamily: "Fredoka, sans-serif" }}
          >
            Welcome to WhyPals!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Quicksand, sans-serif" }}>
            A fun and safe place for kids to learn about the world by exploring real things happening
            around them, turning everyday events into simple stories.
          </p>
        </section>

        {user && (
          <section className="mb-12">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">Your Activity Today</h3>
            <ActivityDisplay />
          </section>
        )}

        <section className="grid md:grid-cols-3 gap-6">
          <a
            href="/stories"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border border-teal-100"
          >
            <div className="text-4xl mb-3">📖</div>
            <h3 className="text-xl font-bold text-teal-700 mb-2">Stories</h3>
            <p className="text-gray-600">Read fun news stories written just for kids!</p>
          </a>
          <a
            href="/games"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border border-teal-100"
          >
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-xl font-bold text-teal-700 mb-2">Games</h3>
            <p className="text-gray-600">Play educational games and earn points!</p>
          </a>
          <a
            href="/videos"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border border-teal-100"
          >
            <div className="text-4xl mb-3">🎬</div>
            <h3 className="text-xl font-bold text-teal-700 mb-2">Videos</h3>
            <p className="text-gray-600">Watch exciting videos about the world!</p>
          </a>
        </section>
      </main>

      <footer className="mt-16 py-8 bg-white border-t border-teal-100">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 WhyPals. A safe place for curious kids.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
