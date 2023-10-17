import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminSidebar from "./AdminSidebar";
import { useEffect, useState } from "react";
import api from "../api";
import CategoryUpdateModal from "./UpdateCategoryModal";
import ConfirmationModal from "./ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../slices/accountSlices";

export default function ListCategory() {
  const [activeItem, setActiveItem] = useState("category");
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const setActivePage = (itemName) => {
    setActiveItem(itemName);
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("Category is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await api.post("/categories/input", values);
        toast({
          title: "Category created successfully!",
          description: "The new category has been successfully added to the database!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        formik.resetForm();
      } catch (error) {
        toast({
          title: "Error!",
          description: "Error creating category. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      if (response.data.ok) {
        setCategories(response.data.details);
      }
    } catch (error) {
      if (error.response.status === 404) {
        toast({
          title: "Error!",
          description: "Error fetching categories. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else if (error?.response?.status === 403) {
        toast({
          title: "Session expired",
          description: "Your session is expired, please login again.",
          status: "error",
          duration: 3000,
          isClosable: true,
          onCloseComplete() {
            dispatch(logout());
            navigate("/");
          },
        });
      } else if (error?.response?.status === 401) {
        toast({
          title: "You are not an admin!",
          description: "You do not have access to this page!",
          status: "error",
          duration: 3000,
          isClosable: true,
          onCloseComplete() {
            dispatch(logout());
            navigate("/");
          },
        });
      }
    }
  };
  useEffect(() => {
    fetchCategories();
  }, [categories]);

  const handleDeleteCategory = async (categoryName) => {
    setSelectedCategory(categoryName);
    onOpen();
  };

  const handleConfirmDeleteCategory = async () => {
    try {
      await api.delete(`/categories/${selectedCategory}`);
      fetchCategories();
      onClose();
    } catch (error) {
      toast({
        title: "Error!",
        description: "Error deleting category. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaveCategory = async (categoryId, newName) => {
    try {
      const response = await api.put(`/categories/${categoryId}`, { newName });
      if (response.data.ok) {
        // Update the UI with the new category name if the API call is successful
        const updatedCategories = categories.map((category) => {
          if (category.id === categoryId) {
            return { ...category, name: newName };
          } else {
            return category;
          }
        });
        setCategories(updatedCategories);
      } else {
        toast({
          title: "Error!",
          description: "Error updating category. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "Error updating category. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <AdminSidebar setActivePage={setActivePage} activeItem={activeItem} />
      <Flex direction={"row"} ml={{ base: 0, md: 64 }}>
        <Box bgColor={"#f7f7f7"} h={"100vh"} w={"85vw"} p={"40px"}>
          <Box bgColor={"white.700"} boxShadow={"md"} border={"1px solid"} borderColor={"blackAlpha.100"} p={"20px"} h={"90vh"} borderRadius={"10px"}>
            <Text fontWeight="bold" mt="38px" mb={"20px"} fontSize="2xl">
              Add Category
            </Text>
            <form onSubmit={formik.handleSubmit}>
              <FormControl isInvalid={formik.errors.name && formik.touched.name}>
                <FormLabel htmlFor="name">Category Name</FormLabel>
                <Input type="text" id="name" name="name" placeholder="Category Name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} w={"100%"} />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>

              <Button mt={4} bgColor={"orange.300"} color={"white"} isLoading={formik.isSubmitting} type="submit">
                Create Category
              </Button>
            </form>
            <Text fontWeight="bold" mt="38px" mb={"20px"} fontSize="2xl">
              Category List
            </Text>
            <Box display={"flex"} flexDir={"column"}>
              {categories.length === 0 ? (
                <Text>Category is Empty!</Text>
              ) : (
                categories.map((category, index) => (
                  <div key={index}>
                    <Box display={"flex"} w={"80vw"} h={"10%"} alignItems={"center"}>
                      <Box display={"flex"} my={"5px"}>
                        <Text fontSize={"20px"} minW={"67vw"}>
                          {category.name}
                        </Text>
                        <Button colorScheme="red" onClick={() => handleDeleteCategory(category.name)}>
                          Delete
                        </Button>
                        <Button
                          colorScheme="blue"
                          onClick={() => {
                            setIsModalOpen(true);
                            setSelectedCategory(category);
                          }}>
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  </div>
                ))
              )}
              <CategoryUpdateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCategory} categoryToEdit={selectedCategory} />
              <ConfirmationModal isOpen={isOpen} onClose={onClose} onConfirm={handleConfirmDeleteCategory} message={`Are you sure you want to delete the category: ${selectedCategory}?`} />
            </Box>
          </Box>
        </Box>
      </Flex>
    </>
  );
}
