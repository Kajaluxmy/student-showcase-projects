import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { Loader2, Save, FileImage, AlertTriangle, ArrowLeft } from 'lucide-react';

export function ProjectFormPage() {
  const { id } = useParams(); // undefined on create
  const isEdit = !!id;
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  
  // Operational states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    async function loadProjectDetails() {
      try {
        const res = await apiClient(`/projects/${id}`);
        if (res.success && res.data?.project) {
          const p = res.data.project;
          setTitle(p.title);
          setDescription(p.description);
          setTechInput(p.technology_stack?.join(', ') || '');
          setGithubUrl(p.github_url || '');
        }
      } catch (err) {
        setServerError('Failed to load project details for editing.');
      } finally {
        setInitialLoading(false);
      }
    }
    loadProjectDetails();
  }, [id, isEdit]);

  const validateForm = () => {
    const newErrors = {};

    if (title.length < 5 || title.length > 100) {
      newErrors.title = 'Title must be between 5 and 100 characters.';
    }

    if (description.length < 20) {
      newErrors.description = 'Description must contain at least 20 characters.';
    }

    const tags = techInput.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length === 0) {
      newErrors.techInput = 'Please list at least one technology tag.';
    }

    if (githubUrl) {
      try {
        new URL(githubUrl);
      } catch (e) {
        newErrors.githubUrl = 'Invalid URL format. Include http:// or https://.';
      }
    }

    if (!isEdit && !thumbnailFile) {
      newErrors.thumbnail = 'Project thumbnail image is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;

    setLoading(true);

    const tags = techInput.split(',').map(t => t.trim()).filter(Boolean);

    // Multi-part form creation for file upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('technologyStack', JSON.stringify(tags));
    formData.append('githubUrl', githubUrl || '');
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      let res;
      if (isEdit) {
        res = await apiClient(`/projects/${id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        res = await apiClient('/projects', {
          method: 'POST',
          body: formData
        });
      }

      if (res.success && res.data?.project) {
        navigate(`/projects/${res.data.project.id}`);
      }
    } catch (err) {
      setServerError(err.message || 'Operation failed. Please verify inputs.');
      if (err.details) {
        const formErrors = {};
        err.details.forEach(d => {
          formErrors[d.field] = d.message;
        });
        setErrors(formErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      
      {/* Back link */}
      <Link to={isEdit ? `/projects/${id}` : '/dashboard'} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-semibold flex items-center gap-1.5 self-start">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Cancel and Return</span>
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Glow Element */}
        <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl pointer-events-none"></div>
        <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400 mt-2">
            {isEdit ? 'Edit Published Project' : 'Publish New Project'}
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
            Describe your application, map the tech stack, and link your code repository.
          </p>
        </div>
      </div>
        {serverError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2 shadow-lg animate-shake">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10 mt-4">
          
          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-white-450 tracking-wider">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Capstone Microservices"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-black placeholder-zinc-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all font-semibold"
            />
            {errors.title && <p className="text-red-400 text-[10px] mt-1 font-semibold">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5 mt-4">
            <label className="block text-[10px] font-bold text-white-450  tracking-wider">Project Description</label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of features, technical architectures, database choices, and system design..."
              className="w-full bg-zinc-955 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-black placeholder-zinc-650 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all font-semibold resize-y"
            />
            {errors.description && <p className="text-red-400 text-[10px] mt-1 font-semibold">{errors.description}</p>}
          </div>

          {/* Tech Stack tags input */}
          <div className="space-y-1.5 mt-4">
            <label className="block text-[10px] font-bold text-white-450  tracking-wider">Technology Stack</label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="React, Node.js, MySQL, Docker (comma separated)"
              className="w-full bg-zinc-955 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-black placeholder-zinc-655 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all font-semibold"
            />
            {errors.techInput && <p className="text-red-400 text-[10px] mt-1 font-semibold">{errors.techInput}</p>}
          </div>

          {/* GitHub Repository */}
          <div className="space-y-1.5 mt-4">
            <label className="block text-[10px] font-bold text-white-450  tracking-wider">GitHub Repository URL (Optional)</label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/your-username/repository"
              className="w-full bg-zinc-955 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-black placeholder-zinc-655 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all font-semibold"
            />
            {errors.githubUrl && <p className="text-red-400 text-[10px] mt-1 font-semibold">{errors.githubUrl}</p>}
          </div>

          {/* Thumbnail upload */}
          <div className="space-y-1.5 mt-4">
            <label className="block text-[10px] font-bold text-white-450  tracking-wider">Project Thumbnail</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-36 border border-zinc-800 border-dashed rounded-xl cursor-pointer bg-zinc-955 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <FileImage className="w-8 h-8 mb-2 text-zinc-500" />
                  <p className="text-xs text-zinc-400 font-bold max-w-xs truncate">
                    {thumbnailFile ? thumbnailFile.name : 'Click to select project thumbnail'}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">JPEG, PNG, or WEBP (Max 2MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                />
              </label>
            </div>
            {errors.thumbnail && <p className="text-red-400 text-[10px] mt-1 font-semibold">{errors.thumbnail}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-5 border-zinc-855 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all disabled:opacity-50 leading-none shadow-md"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <Save className="h-4 w-4 shrink-0" />
              )}
              <span className="leading-none">{isEdit ? 'Save Changes' : 'Publish Project'}</span>
            </button>
            
            <Link
              to={isEdit ? `/projects/${id}` : '/dashboard'}
              className="flex-1 text-center bg-zinc-955 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-350 font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center leading-none active:scale-[0.98]"
            >
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
