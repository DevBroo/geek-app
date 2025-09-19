// Inventory
import { List, Datagrid, TextField, NumberField, EditButton, Edit, SimpleForm, TextInput, NumberInput, Create, required } from 'react-admin';


export const InventoryList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="productName" />
            <NumberField source="stock" />
            <TextField source="location" />
            <EditButton />
        </Datagrid>
    </List>
);

export const InventoryEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput disabled source="id" />
            <TextInput disabled source="productName" />
            <NumberInput source="stock" validate={required()} />
            <TextInput source="location" />
        </SimpleForm>
    </Edit>
);

export const InventoryCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="productName" validate={required()} />
            <NumberInput source="stock" validate={required()} />
            <TextInput source="location" validate={required()} />
        </SimpleForm>
    </Create>
);