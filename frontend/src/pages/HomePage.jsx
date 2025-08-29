import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import RateLimitedUI from "../Components/RateLimitedUI";
import api from "../lib/axios";
import toast from "react-hot-toast";
import NoteCard from "../Components/NoteCard";
import NotesNotFound from "../Components/NotesNotFound";

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await api.get("/notes");
        setNotes(res.data);
        setIsRateLimited(false);
        setRetrySeconds(0);
      } catch (error) {
        if (error.response?.status === 429) {
          setIsRateLimited(true);

          // Backend should send Retry-After header
          const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
          setRetrySeconds(retryAfter);

          toast.error(`Too many requests. Retrying in ${retryAfter} seconds.`);

          setTimeout(fetchNotes, retryAfter * 1000);
        } else {
          toast.error("Failed to load notes");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {isRateLimited && <RateLimitedUI retryIn={retrySeconds} />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && !isRateLimited && (
          <div className="text-center text-primary py-10">
            Loading notes...
          </div>
        )}

        {notes.length === 0 && !isRateLimited && !loading && <NotesNotFound />}

        {notes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
