import React from 'react';
import { CheckTemplateManager } from '@/components/admin/CheckTemplateManager';
import { RoleBasedWrapper } from '@/components/RoleBasedWrapper';

export default function CheckTemplates() {
  return (
    <RoleBasedWrapper allowedRoles={['admin', 'property_manager']}>
      <div className="container mx-auto px-4 py-6">
        <CheckTemplateManager />
      </div>
    </RoleBasedWrapper>
  );
}