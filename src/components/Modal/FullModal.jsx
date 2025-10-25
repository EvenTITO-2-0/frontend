import React from 'react'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/modal'
import { Button } from '@nextui-org/button'

export default function FullModal({
  trigger,
  title,
  children,
  onSubmit,
  submitButtonText,
  isPending,
  submitButtonDisabled = false,
  hideSubmitButton = false,
  placement = 'top-center',
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  async function handleSubmit(onClose) {
    await onSubmit(onClose)
  }

  return (
    <>
      {trigger(onOpen)}
      <Modal
        isOpen={isOpen}
        size="full"
        onOpenChange={onOpenChange}
        placement={placement}
        className=""
      >
        <ModalContent>
          {(onClose) => (
            <div className="mx-auto w-2/3 px-10 space-y-6">
              <ModalHeader className="flex flex-col gap-1 font-bold text-3xl">
                {title}
              </ModalHeader>
              <ModalBody className="space-y-6">{children}</ModalBody>
              {!hideSubmitButton && (
                <ModalFooter>
                  <Button
                    className="w-full"
                    color="primary"
                    variant="flat"
                    onPress={() => handleSubmit(onClose)}
                    isLoading={isPending}
                    isDisabled={submitButtonDisabled}
                  >
                    {!isPending ? (
                      <>
                        {submitButtonText ? (
                          <span className="mr-2">{submitButtonText}</span>
                        ) : (
                          <p>Crear evento</p>
                        )}
                      </>
                    ) : null}
                  </Button>
                </ModalFooter>
              )}
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
