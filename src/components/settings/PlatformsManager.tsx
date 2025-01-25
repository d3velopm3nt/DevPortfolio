import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Monitor, Smartphone, Watch, Tv, Cpu } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Platform, OperatingSystem } from '../../types';

interface PlatformFormData {
  name: string;
  description: string;
}

interface OSFormData {
  name: string;
  version: string;
  platform_id: string;
}

export function PlatformsManager() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<OperatingSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddPlatformModalOpen, setIsAddPlatformModalOpen] = useState(false);
  const [isAddOSModalOpen, setIsAddOSModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [editingOS, setEditingOS] = useState<OperatingSystem | null>(null);
  const [platformForm, setPlatformForm] = useState<PlatformFormData>({
    name: '',
    description: ''
  });
  const [osForm, setOSForm] = useState<OSFormData>({
    name: '',
    version: '',
    platform_id: ''
  });

  useEffect(() => {
    fetchPlatformsAndOS();
  }, []);

  const fetchPlatformsAndOS = async () => {
    try {
      const [platformsResponse, osResponse] = await Promise.all([
        supabase.from('platforms').select('*').order('name'),
        supabase.from('operating_systems').select('*').order('name')
      ]);

      if (platformsResponse.error) throw platformsResponse.error;
      if (osResponse.error) throw osResponse.error;

      setPlatforms(platformsResponse.data);
      setOperatingSystems(osResponse.data);
    } catch (err) {
      console.error('Error fetching platforms and OS:', err);
      setError('Failed to load platforms and operating systems');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = editingPlatform
        ? await supabase
            .from('platforms')
            .update(platformForm)
            .eq('id', editingPlatform.id)
        : await supabase
            .from('platforms')
            .insert([platformForm]);

      if (error) throw error;

      await fetchPlatformsAndOS();
      handleClosePlatformModal();
    } catch (err) {
      console.error('Error saving platform:', err);
      setError('Failed to save platform');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = editingOS
        ? await supabase
            .from('operating_systems')
            .update(osForm)
            .eq('id', editingOS.id)
        : await supabase
            .from('operating_systems')
            .insert([osForm]);

      if (error) throw error;

      await fetchPlatformsAndOS();
      handleCloseOSModal();
    } catch (err) {
      console.error('Error saving OS:', err);
      setError('Failed to save operating system');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlatform = async (platform: Platform) => {
    if (!window.confirm(`Are you sure you want to delete ${platform.name}? This will also delete all associated operating systems.`)) return;

    try {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', platform.id);

      if (error) throw error;
      await fetchPlatformsAndOS();
    } catch (err) {
      console.error('Error deleting platform:', err);
      setError('Failed to delete platform');
    }
  };

  const handleDeleteOS = async (os: OperatingSystem) => {
    if (!window.confirm(`Are you sure you want to delete ${os.name} ${os.version}?`)) return;

    try {
      const { error } = await supabase
        .from('operating_systems')
        .delete()
        .eq('id', os.id);

      if (error) throw error;
      await fetchPlatformsAndOS();
    } catch (err) {
      console.error('Error deleting OS:', err);
      setError('Failed to delete operating system');
    }
  };

  const handleEditPlatform = (platform: Platform) => {
    setEditingPlatform(platform);
    setPlatformForm({
      name: platform.name,
      description: platform.description || ''
    });
    setIsAddPlatformModalOpen(true);
  };

  const handleEditOS = (os: OperatingSystem) => {
    setEditingOS(os);
    setOSForm({
      name: os.name,
      version: os.version || '',
      platform_id: os.platform_id
    });
    setIsAddOSModalOpen(true);
  };

  const handleClosePlatformModal = () => {
    setIsAddPlatformModalOpen(false);
    setEditingPlatform(null);
    setPlatformForm({
      name: '',
      description: ''
    });
  };

  const handleCloseOSModal = () => {
    setIsAddOSModalOpen(false);
    setEditingOS(null);
    setOSForm({
      name: '',
      version: '',
      platform_id: ''
    });
  };

  const getPlatformIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'desktop':
        return Monitor;
      case 'mobile':
        return Smartphone;
      case 'watch':
        return Watch;
      case 'tv':
        return Tv;
      case 'iot':
        return Cpu;
      default:
        return Monitor;
    }
  };

  if (isLoading && !isAddPlatformModalOpen && !isAddOSModalOpen) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Platforms</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage platforms and operating systems
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsAddOSModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            <Plus className="w-5 h-5" />
            Add OS
          </button>
          <button
            onClick={() => setIsAddPlatformModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            <Plus className="w-5 h-5" />
            Add Platform
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {platforms.map((platform) => {
          const PlatformIcon = getPlatformIcon(platform.name);
          const platformOS = operatingSystems.filter(os => os.platform_id === platform.id);

          return (
            <div
              key={platform.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                      <PlatformIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {platform.name}
                      </h3>
                      {platform.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {platform.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditPlatform(platform)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlatform(platform)}
                      className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Operating Systems
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {platformOS.map((os) => (
                      <div
                        key={os.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <span className="text-gray-900 dark:text-white">
                          {os.name} {os.version}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditOS(os)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOS(os)}
                            className="p-1 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Platform Modal */}
      {isAddPlatformModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPlatform ? 'Edit Platform' : 'Add Platform'}
                </h2>
                <button
                  onClick={handleClosePlatformModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePlatformSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={platformForm.name}
                    onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={platformForm.description}
                    onChange={(e) => setPlatformForm({ ...platformForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleClosePlatformModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingPlatform ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit OS Modal */}
      {isAddOSModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingOS ? 'Edit Operating System' : 'Add Operating System'}
                </h2>
                <button
                  onClick={handleCloseOSModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleOSSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Platform
                  </label>
                  <select
                    value={osForm.platform_id}
                    onChange={(e) => setOSForm({ ...osForm, platform_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Platform</option>
                    {platforms.map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={osForm.name}
                    onChange={(e) => setOSForm({ ...osForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={osForm.version}
                    onChange={(e) => setOSForm({ ...osForm, version: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCloseOSModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingOS ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}