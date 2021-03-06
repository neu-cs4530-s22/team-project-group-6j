import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  
  Stack,
  
  useToast
} from '@chakra-ui/react';
import React,{ useCallback,useState } from 'react';
import ConversationArea from '../../classes/ConversationArea';
import ConversationAreaPoll from '../../classes/pollClasses/ConversationAreaPoll';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';


type NewConversationPollModalProps = {
    isOpen: boolean;
    closeModal: ()=>void;
    conversation: ConversationArea;
    creator: string;
}

// A poll may have up to 4 options
type PollOptions = {
  first: string | undefined,
  second: string | undefined,
  third: string | undefined,
  fourth: string | undefined,
};

// Form modal for inputting the description of the poll to create.
export default function NewConversationPollModal( {isOpen, closeModal, conversation, creator} : NewConversationPollModalProps): JSX.Element {
    const [prompt, setPrompt] = useState<string>('');
    const [options, setOptions] = useState<PollOptions>();
    const [duration, setDuration] = useState<number>(60); // the default poll duration is 1 minute
    const {apiClient, sessionToken, currentTownID} = useCoveyAppState();

    const toast = useToast()
    const video = useMaybeVideo()

    const createConversationPoll = useCallback(async () => {
      if (prompt && options?.first && options?.second && duration) {
        const pollOptions = [];
        pollOptions.push(options.first);
        pollOptions.push(options.second);
        if (options.third) { pollOptions.push(options.third); }
        if (options.fourth) { pollOptions.push(options.fourth); }
  
        const conversationToUpdate = conversation;
        const newPoll = new ConversationAreaPoll(prompt, conversation.getBoundingBox(), creator, pollOptions, duration);
        conversationToUpdate.activePoll = newPoll;

        try {
          await apiClient.createPoll({
            sessionToken,
            coveyTownID: currentTownID,
            conversationArea: conversationToUpdate.toServerConversationArea(),
            poll: newPoll.toServerConversationAreaPoll(),
          });
          toast({
            title: 'Conversation Poll Created!',
            status: 'success',
          });
          video?.unPauseGame();
          closeModal();
        } catch (err) {
          toast({
            title: 'Unable to create conversation poll',
            status: 'error',
          });
        }
      }
    }, [options, prompt, duration, video, closeModal, conversation, creator, toast, apiClient, currentTownID, sessionToken]);
    return (
      <Modal isOpen={isOpen} onClose={()=>{closeModal(); video?.unPauseGame()}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a Poll for the occupants of {conversation.label} </ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={ev => {
              ev.preventDefault();
              createConversationPoll();
            }}>
            <ModalBody pb={6}>
              <FormControl isRequired>
                <FormLabel htmlFor='prompt'>What question do you want to ask?</FormLabel>
                <Input
                  id='prompt'
                  placeholder='Share the topic of your conversation'
                  name='prompt'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor='options.first'>Option 1:</FormLabel>
                <Input
                  id='options.first'
                  placeholder=''
                  name='options.first'
                  value={options?.first}
                  onChange={(e) => setOptions({
                    first: e.target.value,
                    second: options?.second,
                    third: options?.third,
                    fourth: options?.fourth
                  })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor='options.second'>Option 2:</FormLabel>
                <Input
                  id='options.second'
                  placeholder=''
                  name='options.second'
                  value={options?.second}
                  onChange={(e) => setOptions({
                    first: options?.first,
                    second: e.target.value,
                    third: options?.third,
                    fourth: options?.fourth
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='options.third'>Option 3:</FormLabel>
                <Input
                  id='options.third'
                  placeholder=''
                  name='options.third'
                  value={options?.third}
                  onChange={(e) => setOptions({
                    first: options?.first,
                    second: options?.second,
                    third: e.target.value,
                    fourth: options?.fourth
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='options.fourth'>Option 4:</FormLabel>
                <Input
                  id='options.fourth'
                  placeholder=''
                  name='options.fourth'
                  value={options?.fourth}
                  onChange={(e) => setOptions({
                    first: options?.first,
                    second: options?.second,
                    third: options?.third,
                    fourth: e.target.value
                  })}
                />
              </FormControl>
              <RadioGroup>
                <Stack direction='row'>
                  <Radio isChecked={duration === 60} onChange={() => setDuration(60)}>1 Minute</Radio>
                  <Radio isChecked={duration === 180} onChange={() => setDuration(180)}>3 Minutes</Radio>
                  <Radio isChecked={duration === 300} onChange={() => setDuration(300)}>5 Minutes</Radio>
                </Stack>
              </RadioGroup>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={createConversationPoll} disabled={!prompt || !options?.first || !options?.second || !duration}>
                Create
              </Button>
              <Button onClick={closeModal}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
}

