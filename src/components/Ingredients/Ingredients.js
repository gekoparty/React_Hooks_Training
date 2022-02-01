import React, { useReducer, useEffect, useCallback } from "react";
import IngredientList from "./IngredientList";
import IngredientForm from "./IngredientForm";
import Search from "./Search";
import ErrorModal from "../UI/ErrorModal";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("Should net get there");
  }
};

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return { loading: true, error: null };
    case "RESPONSE":
      return { ...curHttpState, loading: false };
    case "ERROR":
      return { loading: false, error: action.errorData };
    case "CLEAR":
      return { ...curHttpState, error: null };
    default:
      throw new Error("Should not get there");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });
  // const [userIngredient, setUserIngredients] = useState([]);
  //const [isLoading, setIsLoading] = useState(false);
  //const [error, setError] = useState();

  // Do not need anymore because retriving in search component
  /* useEffect(() => {
    fetch(
      "https://react-http-24641-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json"
    )
      .then((response) => response.json())
      .then((responseData) => {
        const loadedIngredients = [];
        for (const key in responseData) {
          loadedIngredients.push({
            id: key,
            title: responseData[key].title,
            amount: responseData[key].amount,
          });
        }
        setUserIngredients(loadedIngredients);
      });
  }, []);
 */
  useEffect(() => {
    console.log("rendering", userIngredients);
  }, [userIngredients]);

  const addIngredientHandler = useCallback(ingredient => {
    dispatchHttp({ type: "SEND" });
    fetch(
      "https://react-http-24641-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        dispatchHttp({ type: "RESPONSE" });
        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        /* setUserIngredients((prevIngredients) => [
          ...prevIngredients,
          { id: responseData.name, ...ingredient },
        ]); */
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient },
        });
      });
  }, []);

  const removeIngredientHandler = useCallback(id => {
    dispatchHttp({ type: "SEND" });
    fetch(
      `https://react-http-24641-default-rtdb.europe-west1.firebasedatabase.app/ingredients/${id}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        dispatchHttp({ type: "RESPONSE" });
        /* setUserIngredients((prevIngredients) =>
          prevIngredients.filter((ingredient) => ingredient.id !== id)
        ); */
        dispatch({ type: "DELETE", id: id });
      })
      .catch((error) => {
        dispatchHttp({ type: "ERROR", errorData: error.message });
      });
  }, []);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    //setUserIngredients(filteredIngredients);
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const clearError = () => {
    dispatchHttp({ type: "CLEAR" });
  };

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadedIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
