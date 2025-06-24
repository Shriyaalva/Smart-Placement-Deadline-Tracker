import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useGmail() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectGmail = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/auth/google');
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Gmail. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    },
  });

  const handleGmailCallback = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/auth/google/callback', { code });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({
        title: "Gmail Connected!",
        description: "Your Gmail account has been successfully connected.",
      });
    },
    onError: () => {
      toast({
        title: "Authentication Failed",
        description: "Failed to authenticate with Gmail. Please try again.",
        variant: "destructive",
      });
    },
  });

  const syncEmails = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('POST', '/api/sync-emails', { userId });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/upcoming-deadlines'] });
      toast({
        title: "Emails Synced!",
        description: `Processed ${data.processedCount} emails, found ${data.placementEmailsCount} placement opportunities.`,
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync emails. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    connectGmail: () => {
      setIsConnecting(true);
      connectGmail.mutate();
    },
    handleGmailCallback: handleGmailCallback.mutate,
    syncEmails: syncEmails.mutate,
    isConnecting: isConnecting || connectGmail.isPending,
    isSyncing: syncEmails.isPending,
  };
}
