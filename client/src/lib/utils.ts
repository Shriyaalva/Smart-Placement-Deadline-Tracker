import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null) {
  if (!date) return 'Not specified';
  
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatRelativeTime(date: Date | string) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) {
    return 'Expired';
  } else if (diffInDays === 0) {
    return 'Due today';
  } else if (diffInDays === 1) {
    return 'Due tomorrow';
  } else if (diffInDays <= 7) {
    return `${diffInDays} days left`;
  } else if (diffInDays <= 14) {
    return '1-2 weeks left';
  } else {
    return `${Math.ceil(diffInDays / 7)} weeks left`;
  }
}

export function getUrgencyLevel(deadline: Date | string | null) {
  if (!deadline) return 'none';
  
  const now = new Date();
  const targetDate = new Date(deadline);
  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) {
    return 'expired';
  } else if (diffInDays <= 1) {
    return 'urgent';
  } else if (diffInDays <= 3) {
    return 'warning';
  } else if (diffInDays <= 7) {
    return 'normal';
  } else {
    return 'low';
  }
}

export function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case 'urgent':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'normal':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'expired':
      return 'bg-gray-50 border-gray-200 text-gray-800';
    default:
      return 'bg-green-50 border-green-200 text-green-800';
  }
}

export function getUrgencyBadgeColor(urgency: string) {
  switch (urgency) {
    case 'urgent':
      return 'bg-red-500 text-white';
    case 'warning':
      return 'bg-yellow-500 text-white';
    case 'normal':
      return 'bg-blue-500 text-white';
    case 'expired':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-green-500 text-white';
  }
}
