export const mockSendEmail = async (
  to: string,
  subject: string,
  props: Record<string, any>
): Promise<{ success: boolean; error?: any }> => {
  console.log('Mock email sent:', { to, subject, props });
  return { success: true };
};