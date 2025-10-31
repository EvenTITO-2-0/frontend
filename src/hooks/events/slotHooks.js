import {
  apiAssignWorks,
  apiCreateSlot,
  apiDeleteRooms,
  apiDeleteSlot,
  apiGenerateFromPlantilla,
  apiGetSlotsWithWorks,
  apiUpdateSlot,
} from '@/services/api/events/slots/queries.js'
import { getEventId } from '@/lib/utils.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useGenerateFromPlantillaMutation() {
  const eventId = getEventId();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      return await apiGenerateFromPlantilla(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getEventById', { eventId }],
      })
    },
  });
}

export function useDeleteRoomsMutation() {
  const eventId = getEventId();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      return await apiDeleteRooms(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getEventById', { eventId }],
      })
    },
  });
}

export function useCreateSlotMutation() {
  const eventId = getEventId();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({slot}) => {
      return await apiCreateSlot(eventId, slot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getEventById', { eventId }],
      })
    },
  });
}

export function useUpdateSlotMutation() {
  const eventId = getEventId();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({slotId, slot}) => {
      return await apiUpdateSlot(eventId, slotId, slot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getEventById', { eventId }],
      })
    },
  });
}

export function useDeleteSlotMutation() {
  const eventId = getEventId();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({slotId}) => {
      return await apiDeleteSlot(eventId, slotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getEventById', { eventId }],
      })
    },
  });
}

export function useAssignWorksMutation() {
  const eventId = getEventId();
  return useMutation({
    mutationFn: async () => {
      return await apiAssignWorks(eventId);
    }
  });
}

export function useGetSlotsWithWorksQuery() {
  const eventId = getEventId();
  return useQuery({
    queryKey: ['getSlotsWithWorks', { eventId }],

    queryFn: async () => {
      return await apiGetSlotsWithWorks(eventId);
    }
  });
}