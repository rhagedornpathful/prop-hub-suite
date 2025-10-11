# Feature Modules Architecture

This directory contains domain-driven feature modules for the property management system.

## Module Structure

Each feature module follows this structure:
```
feature-name/
├── components/     # Feature-specific components
├── hooks/          # Feature-specific hooks
├── types/          # TypeScript types/interfaces
├── utils/          # Feature utilities
└── index.ts        # Public API exports
```

## Core Modules

### Properties
Property management, CRUD operations, property details

### Tenants  
Tenant management, lease tracking, tenant communications

### Maintenance
Maintenance requests, scheduling, vendor assignment, work orders

### Financials
Rent collection, owner statements, financial reporting

### Leasing
Lead management, property listings, applications, tours, marketing

### Messaging
Internal messaging, notifications, communication hub

### House Watching
Home checks, property monitoring, check schedules

### Vendors
Vendor management, contractor portal, invoicing

## Usage

Import from feature modules:
```typescript
import { PropertyCard, useProperties } from '@/features/properties';
import { TenantList, useTenants } from '@/features/tenants';
```

## Guidelines

1. **Encapsulation**: Keep feature logic contained within modules
2. **Single Responsibility**: Each module handles one domain
3. **Shared Components**: Use `/components/ui` for shared UI components
4. **Cross-Module**: Use hooks/context for cross-module communication
5. **Type Safety**: Export all types from module index
