import gql from 'graphql-tag';
import client from './client';

// query
export const messagesQuery = gql`
  query MessagesQuery {
    # 'messages' query
    messages {
      id
      from
      text
    }
  }
`;

// mutation
export const addMessageMutation = gql`
  # MessageInput is 'Input Type' to pass a Single Argument here instead of many
  # Defined in schema.graphql
  mutation AddMessageMutation($input: MessageInput!) {
    # message is alias - custom name in resolve object
    message: addMessage(input: $input) {
      id
      from
      text
    }
  }
`;

// subscription
export const messageAddedSubscription = gql`
  subscription {
    messageAdded {
      id
      from
      text
    }
  }
`;

// query function to get messages
export async function getMessages() {
  const { data } = await client.query({ query: messagesQuery });
  return data.messages;
}

// mutation function - now handle by useMutation hook
// export async function addMessage(text) {
//   const { data } = await client.mutate({
//     mutation: addMessageMutation,
//     variables: { input: { text } },
//   });
//   return data.message;
// }

// Subscription function which takes callback function as arg to handle the message
// so that the Server can notify the Client as soon as the Event Occurs
export function onMessageAdded(handleMessage) {
  // here we want to use the apollo client to subscribe by using client.subscribe()
  // subscribe method returns 'observable' which has a 'subscribe' method
  const observable = client.subscribe({ query: messageAddedSubscription });
  // we also need to call 'subscribe' method on the observable returned from above
  // 'subscribe' method takes a callback function where we get Response Object
  return observable.subscribe(({ data }) => handleMessage(data.messageAdded));
  // note - we are using two observable here
  // first one is to get data from the Server
  // second one is to dispatch data to the component
}
