import React, { useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";

interface CreateSectionFormProps {
  onSubmit: (name: string) => Promise<void>;
  isSubmitting: boolean;
}

const CreateSectionForm: React.FC<CreateSectionFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name);
    setName("");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ mt: 1, p: 2 }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          label="New Section Name"
          variant="outlined"
          size="small"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting || !name.trim()}
          sx={{ minWidth: 120, height: 40 }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Add Section"}
        </Button>
      </Stack>
    </Box>
  );
};

export default CreateSectionForm;
