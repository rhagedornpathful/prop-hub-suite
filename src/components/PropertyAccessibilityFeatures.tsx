import React from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface PropertyAccessibilityFeaturesProps {
  onQuickAdd?: () => void;
  onQuickSearch?: () => void;
  onRefresh?: () => void;
}

export const PropertyAccessibilityFeatures: React.FC<PropertyAccessibilityFeaturesProps> = ({
  onQuickAdd,
  onQuickSearch,
  onRefresh
}) => {
  // Register keyboard shortcuts for property management
  useKeyboardShortcuts([
    {
      key: 'a',
      ctrlKey: true,
      description: 'Add new property',
      action: onQuickAdd || (() => {}),
    },
    {
      key: 'f',
      ctrlKey: true,
      description: 'Focus search',
      action: onQuickSearch || (() => {}),
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Refresh properties',
      action: onRefresh || (() => {}),
    },
  ]);

  return (
    <div className="sr-only">
      {/* Screen reader only content */}
      <h2>Property Management Dashboard</h2>
      <p>Use Ctrl+A to add a new property, Ctrl+F to search, or Ctrl+R to refresh the list.</p>
    </div>
  );
};