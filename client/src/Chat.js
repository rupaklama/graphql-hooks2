import React, { useState } from 'react';

// hooks to make queries
import { useQuery, useMutation, useSubscription } from '@apollo/client';

import { messagesQuery, addMessageMutation, messageAddedSubscription } from './graphql/queries';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);

  // useQuery hook returns a 'result' object
  // NOTE - we can pass Query Variables, fetchPolicy & others as
  // second args to useQuery(messagesQuery, {fetchPolicy}) with some Options object

  // const result = useQuery(messagesQuery);
  // console.log(result);
  // const { data, loading, error } = useQuery(messagesQuery);
  // note - useQuery is similar to useState which also has a Setter & Getter funcs
  // 'useQuery' gets call First time with Setter where 'data' prop is 'undefined'
  // 'useQuery' also gets call Second Time with Getter where 'data' prop is 'Response Object'
  // This causes to render this Component Twice, initially with NO DATA & again when DATA is available

  // note - Since we are getting SAME DATA with 'useQuery' & some more data with 'useSubscription' &
  // we needed to COMBINE all these 'data' together
  useQuery(messagesQuery, {
    // onCompleted prop option is where we pass our own function that receives a data when QUERY completes
    onCompleted: data => setMessages(data.messages),
  });

  // NOTE - this hook returns an Array where first element is 'Function' that will execute the mutation
  // First Element in an array is similar to calling 'client.mutate()' directly on Apollo Client
  // note - Calling useMutation does not perform Mutation right away, it simply returns
  // a function that triggers the mutation later
  // note - we can name the First Element Variable whatever we like
  // const [mutate] = useMutation(addMessageMutation);
  const [addMessage] = useMutation(addMessageMutation); // addMessage Mutate func is pass down to handleSend handler
  // note - Second Element 'result' is also a Resolved Object, calling after 'addMessage' mutate function
  // const [addMessage, result] = useMutation(addMessageMutation);
  // const [addMessage, {data, loading, error, called }] = useMutation(addMessageMutation);

  // Note - 'useSubscription' hook automatically takes care of 'unsubscribing' automatically
  // no need of componentWillUnmount or any clean up method
  // Gets Result Object
  // const { data } = useSubscription(messageAddedSubscription);
  // note - Since not working with 'response object' like above we can pass some Options to solve our issue
  // of COMBINING all Data received from 'useQuery' & 'useSubscription' hooks.
  // THIS IS WHEN WE RECEIVE NEW SUBSCRIPTION DATA after subscription query
  useSubscription(messageAddedSubscription, {
    // this will be a func that takes 'result' object
    onSubscriptionData: result => {
      // console.log('onSubscriptionData', result); - {client: ApolloClient, subscriptionData: { data }}}
      // when we receive a new message from the subscription, we want to add it in our state
      setMessages([...messages, result.subscriptionData.data.messageAdded]);
    },
  });

  const handleSend = async text => {
    // using 'addMessage' function here to mutate data
    // 'addMessage' is a mutate function return by useMutation hook
    // accepts an Object where we can pass Options including Query variables
    // passing object property named 'variables' to pass query variables
    // const { data } = addMessage({ variables: { input: { text } } });
    // note - mutate function returns Promise
    // console.log('mutation:', data);

    // Not doing anything here with return data like above example
    // here we just needed to send data to the server, not needed to access 'Resolved Object'
    await addMessage({ variables: { input: { text } } });
  };

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>{error.message}</div>;

  return (
    <section className='section'>
      <div className='container'>
        <h1 className='title'>Chatting as {user}</h1>
        <MessageList user={user} messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </section>
  );
};

export default Chat;
