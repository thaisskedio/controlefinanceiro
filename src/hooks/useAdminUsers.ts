import { useMutation } from '@tanstack/react-query'
import { createInternalUser } from '../services/adminUsers'

export function useCreateInternalUser() {
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      createInternalUser(email, password, name),
  })
}
