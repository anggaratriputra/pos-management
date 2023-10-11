import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Text, useToast } from "@chakra-ui/react";
import AdminSidebar from "./AdminSidebar";
import { useState } from "react";
import api from "../api";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDropzone } from "react-dropzone";

function AddProduct() {
  const [activeItem, setActiveItem] = useState("addProduct");
  const toast = useToast();
  const setActivePage = (itemName) => {
    setActiveItem(itemName);
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Product Name is required"),
    price: Yup.number().required("Price is required"),
    category: Yup.string().required("Category is required"),
    description: Yup.string().required("Description is required"),
  });

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: "image/", //only img file will be acc
    onDrop: (acceptedFiles) => {
      formik.setFieldValue("image", acceptedFiles[0]);
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      category: "",
      description: "",
      image: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new formData();
        formData.append("name", values.name);
        formData.append("price", values.price);
        formData.append("category", values.category);
        formData.append("description", values.description);
        formData.append("image", values.image);

        // Send a POST request to API to update the data in the MySQL database
        await api.post("/products/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast({
          title: "Product Created",
          description: "The product has been successfully added to the database!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Product failed to build!",
          description: String(error),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <>
      <AdminSidebar setActivePage={setActivePage} activeItem={activeItem} />
      <Flex direction={"row"} ml={{ base: 0, md: 60 }}>
        <Box bgColor={"#f7f7f7"} h={"100vh"} w={"100vw"} p={"20px"}>
          <Text fontWeight="bold" mt="38px" mb={"20px"} fontSize="2xl">
            Add Product
          </Text>

          <form onSubmit={formik.handleSubmit}>
            <FormControl isInvalid={formik.errors.name && formik.touched.name}>
              <FormLabel>Product Name</FormLabel>
              <Input type="text" id="productName" name="name" placeholder="Product Name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}></Input>
              <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={formik.errors.price && formik.touched.price}>
              <FormLabel>Price</FormLabel>
              <Input type="number" id="price" name="price" placeholder="Price" value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur}></Input>
              <FormErrorMessage>{formik.errors.price}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={formik.errors.category && formik.touched.category}>
              <FormLabel>Category</FormLabel>
              <Input type="text" id="category" name="category" placeholder="Category" value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur}></Input>
              <FormErrorMessage>{formik.errors.category}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={formik.errors.description && formik.touched.description}>
              <FormLabel>Description</FormLabel>
              <Input type="text" id="description" name="description" placeholder="description" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}></Input>
              <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={formik.errors.image && formik.touched.image}>
              <FormLabel>Product Image</FormLabel>
              <div {...getRootProps()} style={{ border: "2px dashed  #cccccc", borderRadius: "4px", padding: "20px", cursor: "pointer" }}>
                <input {...getRootProps()} />
                <p>Drag 'n' drop an image here, or click to select an image</p>
              </div>
              <FormErrorMessage>{formik.errors.image}</FormErrorMessage>
            </FormControl>

            <Button type="submit" mt={"10px"}>
              Create Product
            </Button>
          </form>
        </Box>
      </Flex>
    </>
  );
}

export default AddProduct;