"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface FavoriteItem {
  id: string;
  user_id: string;
  document_id: string;
  created_at: string;
  document: {
    id: string;
    title: string;
    document_number: string | null;
  } | null;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get("/favorite");
        setFavorites(result.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Favorites</h1>
        <p className="text-slate-600 mt-1">
          Your favorited documents for quick access.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {favorites.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {favorites.map((fav) => (
              <li key={fav.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/documents/${fav.document?.id}`} className="text-sm font-medium text-slate-900 hover:text-blue-600">
                      {fav.document?.title || "Untitled Document"}
                    </Link>
                    {fav.document?.document_number && (
                      <p className="text-xs text-slate-500 mt-0.5">#{fav.document.document_number}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(fav.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <span className="text-2xl mb-2">⭐</span>
            <p className="text-sm">No favorited documents yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
