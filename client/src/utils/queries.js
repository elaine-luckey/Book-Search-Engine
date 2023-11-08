import { gql } from "@apollo/client";

export const GET_ME = gql`
  query me {
    me {
      _id
      email
      username
      bookCount
      savedBooks {
        authors
        bookId
        description
        image
        title
        link
      }
    }
  }
`;