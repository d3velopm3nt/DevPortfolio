import React, { useState, useEffect } from 'react';
import { Loader2, Plus, X, Monitor, Smartphone, Watch, Tv, Cpu } from 'lucide-react';
import { Platform, OperatingSystem, ProjectPlatform } from '../../types';
import { supabase } from '../../lib/supabase';

interface PlatformSelectorProps {
  projectId: string | null; // Changed to allow null
  selectedPlatforms: ProjectPlatform[];
  onPlatformsChange: (platforms: ProjectPlatform[]) => void;
}

export function PlatformSelector({ projectId, selectedPlatforms, onPlatformsChange }: PlatformSelectorProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<OperatingSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);

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

  const handleAddPlatform = () => {
    if (!selectedPlatformId || !selectedOSId) return;

    const platform = platforms.find(p => p.id === selectedPlatformId);
    const os = operatingSystems.find(o => o.id === selectedOSId);

    if (!platform || !os) return;

    // Create a new platform object without making an API call
    const newPlatform: ProjectPlatform = {
      id: crypto.randomUUID(), // Generate a temporary ID
      project_id: projectId || '',
      platform_id: selectedPlatformId,
      operating_system_id: selectedOSId,
      platform,
      operating_system: os
    };

    onPlatformsChange([...selectedPlatforms, newPlatform]);
    setSelectedPlatformId(null);
    setSelectedOSId(null);
  };

  const handleRemovePlatform = (platformId: string) => {
    onPlatformsChange(selectedPlatforms.filter(p => p.id !== platformId));
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Selected Platforms */}
      <div className="flex flex-wrap gap-2">
        {selectedPlatforms.map((projectPlatform) => {
          const PlatformIcon = getPlatformIcon(projectPlatform.platform.name);
          return (
            <div
              key={projectPlatform.id}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg"
            >
              <PlatformIcon className="w-4 h-4" />
              <span>
                {projectPlatform.platform.name} - {projectPlatform.operating_system.name} {projectPlatform.operating_system.version}
              </span>
              <button
                onClick={() => handleRemovePlatform(projectPlatform.id)}
                className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Platform Selector */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Platform
          </label>
          <select
            value={selectedPlatformId || ''}
            onChange={(e) => {
              setSelectedPlatformId(e.target.value || null);
              setSelectedOSId(null);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Platform</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Operating System
          </label>
          <select
            value={selectedOSId || ''}
            onChange={(e) => setSelectedOSId(e.target.value || null)}
            disabled={!selectedPlatformId}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">Select OS</option>
            {operatingSystems
              .filter(os => os.platform_id === selectedPlatformId)
              .map((os) => (
                <option key={os.id} value={os.id}>
                  {os.name} {os.version}
                </option>
              ))}
          </select>
        </div>

        <button
          onClick={handleAddPlatform}
          disabled={!selectedPlatformId || !selectedOSId}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Platform
        </button>
      </div>
    </div>
  );
}