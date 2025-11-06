import {
  apiAssignWorks, apiAssignWorkToSlot,
  apiCreateSlot,
  apiDeleteRooms,
  apiDeleteSlot, apiDeleteWorkSlot,
  apiGenerateFromPlantilla,
  apiGetSlotsWithWorks,
  apiUpdateSlot,
} from '@/services/api/events/slots/queries.js'
import { getEventId } from '@/lib/utils.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {apiGetUnassignedWorks} from "@/services/api/works/queries.js";

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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({parameters}) => {
      return await apiAssignWorks(eventId, parameters);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getSlotsWithWorks', { eventId }],
      });

      queryClient.invalidateQueries({
        queryKey: ['getUnassignedWorks', { eventId }],
      });
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

export function useGetUnassignedSlotsWithWorksQuery() {
  const eventId = getEventId();
  return useQuery({
    queryKey: ['getUnassignedWorks', { eventId }],

    queryFn: async () => {
      return await apiGetUnassignedWorks(eventId);
    }
  });
}

export function useDeleteWorkSlotMutation() {
  const eventId = getEventId();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({workId}) => {
      return await apiDeleteWorkSlot(eventId, workId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getSlotsWithWorks', { eventId }],
      });

      queryClient.invalidateQueries({
        queryKey: ['getUnassignedWorks', { eventId }],
      });
    },
  });
}

export function useAssignWorkToSlotMutation() {
  const eventId = getEventId();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({slot_id: slotId, work_id: workId}) => {
      console.log(`Called mutation assign work ${workId} to slot ${slotId}`)
      return await apiAssignWorkToSlot(eventId, workId, slotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getSlotsWithWorks', { eventId }],
      });

      queryClient.invalidateQueries({
        queryKey: ['getUnassignedWorks', { eventId }],
      });
    },
  });
}