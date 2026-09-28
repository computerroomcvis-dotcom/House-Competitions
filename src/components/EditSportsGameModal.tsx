import React, { useState, useRef } from 'react';
import { SportsActivityEvent, House, Student, GradeLevel, ALL_GRADES, GRADE_LABELS } from '../types';
import {
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Shield,
  Users,
  Plus,
  Trash2,
  Check,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';

interface EditSportsGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: SportsActivityEvent | null; // null for creating a new game
  houses: House[];
  students: Student[];
  onSave: (savedEvent: SportsActivityEvent) => void;
}

// Built-in high-quality sports presets for instant selection
const SPORTS_IMAGE_PRESETS = [
  {
    label: 'Track & Sprint Relay',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Tug-of-War & Field',
    url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Swimming Gala',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Obstacle Course & Pitch',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Indoor Gym & Dodgeball',
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'House Cheer & Rally',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
  },
];

export const EditSportsGameModal: React.FC<EditSportsGameModalProps> = ({
  isOpen,
  onClose,
  event,
  houses,
  students,
  onSave,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState(event?.title || '');
  const [category, setCategory] = useState<SportsActivityEvent['category']>(
    event?.category || 'Sports Week'
  );
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(event?.date || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(event?.time || '09:00 AM – 11:30 AM');
  const [location, setLocation] = useState(
    event?.location || 'Main Covered Sports Arena & Track'
  );

  // Scoring states
  const [firstPlace, setFirstPlace] = useState<number>(
    event?.scoringBreakdown?.firstPlace ?? 150
  );
  const [secondPlace, setSecondPlace] = useState<number>(
    event?.scoringBreakdown?.secondPlace ?? 120
  );
  const [thirdPlace, setThirdPlace] = useState<number>(
    event?.scoringBreakdown?.thirdPlace ?? 95
  );
  const [fourthPlace, setFourthPlace] = useState<number>(
    event?.scoringBreakdown?.fourthPlace ?? 80
  );
  const [bonusNotes, setBonusNotes] = useState(
    event?.scoringBreakdown?.bonusNotes ||
      '+15 Bonus points awarded for outstanding House chant & team spirit'
  );

  // Rules states
  const [rules, setRules] = useState<string[]>(
    event?.rules && event.rules.length > 0
      ? [...event.rules]
      : [
          'Each house enters mixed-gender teams representing early years through Grade 5.',
          'Baton pass must be fully completed inside the 20-meter marked changeover box.',
          'Athletic footwear with non-marking rubber soles is strictly required on track lanes.',
          'All points earned directly add to the cumulative Society of Houses Cup standings.',
        ]
  );
  const [newRuleInput, setNewRuleInput] = useState('');

  // Participating students state
  const [participatingIds, setParticipatingIds] = useState<string[]>(
    event?.participatingStudentIds || []
  );
  const [studentSearch, setStudentSearch] = useState('');
  const [studentHouseFilter, setStudentHouseFilter] = useState<string>('all');
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>('all');

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string>(
    event?.imageUrl || SPORTS_IMAGE_PRESETS[0].url
  );
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Status
  const [isActive, setIsActive] = useState<boolean>(event?.isActive ?? true);

  // Handle image upload from computer
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }
    // Check file size (cap at 6MB for safe local storage)
    if (file.size > 6 * 1024 * 1024) {
      alert('Image size exceeds 6MB. Please upload a smaller image file.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Rule management
  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setRules([...rules, newRuleInput.trim()]);
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Participant management
  const toggleStudent = (studentId: string) => {
    if (participatingIds.includes(studentId)) {
      setParticipatingIds(participatingIds.filter((id) => id !== studentId));
    } else {
      setParticipatingIds([...participatingIds, studentId]);
    }
  };

  const handleSelectAllInFilter = () => {
    const idsToAdd = filteredStudents.map((s) => s.id);
    const set = new Set([...participatingIds, ...idsToAdd]);
    setParticipatingIds(Array.from(set));
  };

  const handleDeselectAllInFilter = () => {
    const idsToRemove = new Set(filteredStudents.map((s) => s.id));
    setParticipatingIds(participatingIds.filter((id) => !idsToRemove.has(id)));
  };

  // Filter students for participant selector
  const filteredStudents = students.filter((s) => {
    if (studentHouseFilter !== 'all' && s.houseId !== studentHouseFilter) return false;
    if (studentGradeFilter !== 'all' && s.grade !== studentGradeFilter) return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a Game Title.');
      return;
    }

    const scoringSummary = `1st Place: ${firstPlace} pts | 2nd Place: ${secondPlace} pts | 3rd Place: ${thirdPlace} pts | 4th Place: ${fourthPlace} pts`;

    // Retain existing scores or initialize with 0 for each house
    const existingScores = event?.scores && event.scores.length > 0
      ? event.scores
      : houses.map((h, i) => ({
          houseId: h.id,
          points: 0,
          placement: (i + 1) as 1 | 2 | 3 | 4,
        }));

    const saved: SportsActivityEvent = {
      id: event?.id || `sports-game-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim() || 'Inter-house championship competition.',
      date: date.trim() || new Date().toISOString().slice(0, 10),
      time: time.trim() || '09:00 AM – 11:30 AM',
      location: location.trim() || 'Main Athletics Track & Sports Arena',
      participatingStudentIds: participatingIds,
      scoringSystem: scoringSummary,
      scoringBreakdown: {
        firstPlace,
        secondPlace,
        thirdPlace,
        fourthPlace,
        bonusNotes: bonusNotes.trim(),
      },
      rules: rules.filter((r) => r.trim().length > 0),
      imageUrl: imageUrl.trim() || SPORTS_IMAGE_PRESETS[0].url,
      isActive,
      scores: existingScores,
      notes: event?.notes,
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">
                {event ? 'Edit Sports Week Game Card' : 'Create Sports Week Game Card'}
              </h2>
              <p className="text-xs text-slate-300">
                Configure game details, when, where, participants, rules, scoring, and cover image.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* SECTION 1: Game Cover Image Upload */}
          <div className="space-y-2">
            <label className="block text-xs uppercase font-extrabold text-slate-700 tracking-wider">
              Game Cover Image (Upload or Pick a Preset)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Image Preview Box */}
              <div className="md:col-span-5 relative group rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 aspect-video md:aspect-4/3 flex items-center justify-center shadow-xs">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Game Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-1 opacity-50" />
                    <span className="text-xs font-semibold">No Image Uploaded</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Change Image
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Drop Zone & Presets */}
              <div className="md:col-span-7 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />

                {/* Drag and drop box */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-800">
                    Click to upload game photo or drag &amp; drop
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports PNG, JPG, WebP up to 6MB. Saved automatically.
                  </p>
                  {isUploading && (
                    <span className="inline-block mt-2 text-xs text-indigo-600 font-semibold animate-pulse">
                      Processing image...
                    </span>
                  )}
                </div>

                {/* Presets */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Or select from school sports photo presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SPORTS_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                          imageUrl === preset.url
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* SECTION 2: Basic Game Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase font-extrabold text-slate-700 tracking-wider mb-1">
                Game Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Sports Week Sprint Relays & Shuttle Run"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-extrabold text-slate-700 tracking-wider mb-1">
                Event Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
              >
                <option value="Sports Week">Sports Week</option>
                <option value="Track & Field">Track &amp; Field</option>
                <option value="Swimming Gala">Swimming Gala</option>
                <option value="Spirit Week">Spirit Week</option>
                <option value="Quiz Bowl">Quiz Bowl</option>
                <option value="General Activity">General Activity</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs uppercase font-extrabold text-slate-700 tracking-wider mb-1">
                Game Overview / Summary
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of the game format, division, and excitement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* SECTION 3: When & Where */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs uppercase font-extrabold text-slate-800 tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>When &amp; Where (Schedule &amp; Location)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Date (When)</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time / Session</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08:30 AM – 11:30 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location (Where)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Athletics Track & Arena"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: The Scoring System */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs uppercase font-extrabold text-amber-900 tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>The Scoring System</span>
              </h3>
              <span className="text-[11px] text-amber-800 font-medium">
                Points add directly to the cumulative House Standings
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                <span className="block text-[11px] font-extrabold text-amber-600 uppercase">
                  🥇 1st Place
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={firstPlace}
                    onChange={(e) => setFirstPlace(Number(e.target.value) || 0)}
                    className="w-full text-lg font-black text-slate-900 bg-amber-50/50 border border-slate-300 rounded px-2 py-1"
                  />
                  <span className="text-xs font-bold text-slate-500">pts</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="block text-[11px] font-extrabold text-slate-600 uppercase">
                  🥈 2nd Place
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={secondPlace}
                    onChange={(e) => setSecondPlace(Number(e.target.value) || 0)}
                    className="w-full text-lg font-black text-slate-900 bg-slate-50 border border-slate-300 rounded px-2 py-1"
                  />
                  <span className="text-xs font-bold text-slate-500">pts</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                <span className="block text-[11px] font-extrabold text-amber-800 uppercase">
                  🥉 3rd Place
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={thirdPlace}
                    onChange={(e) => setThirdPlace(Number(e.target.value) || 0)}
                    className="w-full text-lg font-black text-slate-900 bg-amber-50/50 border border-slate-300 rounded px-2 py-1"
                  />
                  <span className="text-xs font-bold text-slate-500">pts</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="block text-[11px] font-extrabold text-slate-500 uppercase">
                  🎖️ 4th Place
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={fourthPlace}
                    onChange={(e) => setFourthPlace(Number(e.target.value) || 0)}
                    className="w-full text-lg font-black text-slate-900 bg-slate-50 border border-slate-300 rounded px-2 py-1"
                  />
                  <span className="text-xs font-bold text-slate-500">pts</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-900 mb-1">
                Fair Play &amp; Bonus Scoring Notes
              </label>
              <input
                type="text"
                placeholder="e.g. +15 Bonus points awarded for outstanding House chant & team spirit"
                value={bonusNotes}
                onChange={(e) => setBonusNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {/* SECTION 5: The Rules of the Game */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-extrabold text-slate-800 tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>The Rules of the Game ({rules.length})</span>
              </h3>
            </div>

            <div className="space-y-2">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => {
                      const updated = [...rules];
                      updated[idx] = e.target.value;
                      setRules(updated);
                    }}
                    className="flex-1 text-xs text-slate-800 bg-transparent border-none focus:outline-hidden focus:ring-1 focus:ring-emerald-500 rounded px-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                    title="Remove rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new rule */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add another game rule or regulation..."
                value={newRuleInput}
                onChange={(e) => setNewRuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>
          </div>

          {/* SECTION 6: Students Who Are Participating */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs uppercase font-extrabold text-slate-800 tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Students Participating in this Game ({participatingIds.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select student athletes taking part in this specific event.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllInFilter}
                  className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                >
                  Select Filtered ({filteredStudents.length})
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllInFilter}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Deselect Filtered
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <select
                value={studentHouseFilter}
                onChange={(e) => setStudentHouseFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="all">All Houses</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>

              <select
                value={studentGradeFilter}
                onChange={(e) => setStudentGradeFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="all">All Grades (TP – G5)</option>
                {ALL_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Students Selection Grid */}
            <div className="max-h-52 overflow-y-auto bg-white rounded-lg border border-slate-200 p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
              {filteredStudents.map((s) => {
                const isSelected = participatingIds.includes(s.id);
                const house = houses.find((h) => h.id === s.houseId);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-bold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStudent(s.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: house?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        {s.grade} &bull; {house?.name}
                      </p>
                    </div>
                  </label>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-slate-400">
                  No students matched your search or filters.
                </div>
              )}
            </div>
          </div>

          {/* SECTION 7: Status */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800">Event Live Status</span>
              <p className="text-[11px] text-slate-500">
                Active games display highlighted in the Sports Week live event feeds.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isActive ? 'Live / Active' : 'Scheduled / Archived'}
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{event ? 'Save Game Card' : 'Create Game Card'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
