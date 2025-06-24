import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useReminders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateOpportunity = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/opportunities/${id}`, { status });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/upcoming-deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Status Updated",
        description: `Opportunity status updated to ${data.status}.`,
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update opportunity status.",
        variant: "destructive",
      });
    },
  });

  const updateSettings = useMutation({
    mutationFn: async ({ userId, settings }: { userId: number; settings: any }) => {
      const response = await apiRequest('PATCH', `/api/settings/${userId}`, settings);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Updated",
        description: "Your reminder settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  return {
    updateOpportunity: updateOpportunity.mutate,
    updateSettings: updateSettings.mutate,
    isUpdating: updateOpportunity.isPending || updateSettings.isPending,
  };
}
