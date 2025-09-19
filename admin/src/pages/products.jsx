// src/products.tsx
import {
    List, Datagrid, TextField, NumberField, ImageField, ArrayField, SingleFieldList,
    ChipField, Edit, SimpleForm, TextInput, NumberInput, ImageInput, Create, required,
    ArrayInput, SimpleFormIterator,
} from 'react-admin';

export const ProductList = (props) => (
    <List {...props}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <ImageField source="image" title="name" />
            <NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
            <NumberField source="stock" />
            <ArrayField source="attributes">
                <SingleFieldList>
                    <ChipField source="value" />
                </SingleFieldList>
            </ArrayField>
        </Datagrid>
    </List>
);

export const ProductEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput disabled source="id" />
            <TextInput source="name" validate={required()} />
            <TextInput multiline source="description" />
            <NumberInput source="price" />
            <NumberInput source="stock" />
            <ImageInput source="image" accept="image/*" multiple>
                <ImageField source="src" />
            </ImageInput>
            <ArrayInput source="attributes">
                <SimpleFormIterator>
                    <TextInput source="name" helperText="e.g., color" />
                    <TextInput source="value" helperText="e.g., red" />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

export const ProductCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" validate={required()} />
            <TextInput multiline source="description" />
            <NumberInput source="price" />
            <NumberInput source="stock" />
            <ImageInput source="image" accept="image/*" multiple>
                <ImageField source="src" />
            </ImageInput>
            <ArrayInput source="attributes">
                <SimpleFormIterator>
                    <TextInput source="name" helperText="e.g., color" />
                    <TextInput source="value" helperText="e.g., red" />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Create>
);