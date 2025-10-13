import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailGateway } from './EmailGateway';
import { AutoResponseSettings } from './AutoResponseSettings';
import { MessageRules } from './MessageRules';
import { EnhancedTemplateManager } from './EnhancedTemplateManager';

export const IntegrationAutomationPanel = () => {
  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="automation">Automation</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
      </TabsList>
      <TabsContent value="templates" className="space-y-4">
        <EnhancedTemplateManager />
      </TabsContent>
      <TabsContent value="automation" className="space-y-4">
        <AutoResponseSettings />
      </TabsContent>
      <TabsContent value="rules" className="space-y-4">
        <MessageRules />
      </TabsContent>
      <TabsContent value="email" className="space-y-4">
        <EmailGateway />
      </TabsContent>
    </Tabs>
  );
};
