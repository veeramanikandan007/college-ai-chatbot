import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Book,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  FolderPlus,
  Share2,
  Sparkles,
  Tag,
  Clock,
  Layers,
  FileText,
  Bookmark,
  CheckCircle2,
  X
} from 'lucide-react';
import { getNotesHistory, deleteNote, NoteListItem } from '../../api/notes';
import { useToast } from '../../hooks/useToast';

export default function NotesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotesHistory();
      setNotes(data);
    } catch (err: any) {
      showToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.document_name.toLowerCase().includes(q)
    );
  });

  const handleDeleteNote = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this AI-generated note?')) {
      try {
        await deleteNote(id);
        showToast('Note deleted successfully', 'success');
        fetchNotes();
      } catch (err: any) {
        showToast('Failed to delete note', 'error');
      }
    }
  };

  const navigateToCreate = () => {
    navigate('/ai-notes');
  };

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">

        {/* Page Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Book size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                Knowledge Base & Notes
              </h1>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Organize, synthesize, and manage personal course notes and AI study summaries.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={navigateToCreate}
              className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Sparkles size={16} />
              <span>Generate AI Notes</span>
            </button>
          </div>
        </div>

        {/* 4 Statistics Cards Grid (2x2 Mobile, 4-Col Desktop, Responsive Padding & Font Sizes) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 select-none">
          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Notes</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{notes.length}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Academic repository</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Format</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">Smart PDF</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Auto-extracted</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Study Guides</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">Enabled</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">With flashcards</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">AI Synthesis</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">Active</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Auto-summaries</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Content Section Container */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6 select-none">
          
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
            <div className="flex items-center gap-3">
              <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                  Academic Notes & Study Summaries
                </h3>
                <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                  Manage notes, filter by course modules, and view AI generated summaries
                </p>
              </div>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes by title or document name..."
                className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
            </div>
          </div>

          {/* All / Other Notes Grid */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[16px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <FileText size={16} />
              <span>All Notes ({filteredNotes.length})</span>
            </h4>

            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#111827] dark:border-[#FAFAFA] border-t-transparent animate-spin" />
              </div>
            ) : filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-[18px] sm:p-5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] flex flex-col justify-between space-y-4 h-full"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA] truncate max-w-[200px]">
                          {note.document_name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            title="Delete Note"
                            className="h-[34px] w-[34px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.98]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] leading-snug">
                        {note.title}
                      </h4>
                    </div>

                    <div className="pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-[#111827] dark:text-[#FAFAFA]" />
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs space-y-4 my-auto">
                <div className="w-[80px] h-[80px] rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center mx-auto text-[#111827] dark:text-[#FAFAFA]">
                  <Book size={36} />
                </div>
                <div>
                  <h3 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                    No Notes Found
                  </h3>
                  <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] max-w-sm mx-auto mt-1">
                    Try a different search query or generate a new AI study guide.
                  </p>
                </div>
                <button
                  onClick={navigateToCreate}
                  className="h-[40px] px-5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center justify-center gap-2 cursor-pointer mx-auto active:scale-[0.98]"
                >
                  <Sparkles size={16} />
                  <span>Generate AI Notes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

