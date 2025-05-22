using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.DependencyInjection;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Commands
{
    public class CommandConverter : JsonConverter<ICommand>
    {
        private readonly IServiceProvider _serviceProvider;
        
        public CommandConverter(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }
        
        public override ICommand? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions? options)
        {
            using var jsonDoc = JsonDocument.ParseValue(ref reader);
            var jsonObject = jsonDoc.RootElement;

            if (!jsonObject.TryGetProperty("type", out var typeProperty))
            {
                throw new JsonException("Поле 'type' отсутствует в JSON для ICommand");
            }

            var type = typeProperty.GetString();
            using (var scope = _serviceProvider.CreateScope())
            {
                var repository = scope.ServiceProvider.GetRequiredService<ITaskRepository>();
                switch (type)
                {
                    case nameof(CreateTaskCommand):
                        if (jsonObject.TryGetProperty("taskDto", out var createTaskDto))
                        {
                            var taskDto = JsonSerializer.Deserialize<TaskDto>(createTaskDto.GetRawText(), options);
                            return new CreateTaskCommand(taskDto, repository);
                        }

                        break;

                    case nameof(UpdateTaskCommand):
                        if (jsonObject.TryGetProperty("taskDto", out var updateTaskDto))
                        {
                            var taskDto = JsonSerializer.Deserialize<TaskDto>(updateTaskDto.GetRawText(), options);
                            return new UpdateTaskCommand(taskDto, repository);
                        }

                        break;

                    case nameof(DeleteTaskCommand):
                        if (jsonObject.TryGetProperty("taskId", out var taskIdElement))
                        {
                            var taskId = taskIdElement.GetInt32();
                            return new DeleteTaskCommand(taskId, repository);
                        }

                        break;
                }

                throw new JsonException($"Невозможно десериализовать команду типа: {type}");
            }
        }

        public override void Write(Utf8JsonWriter writer, ICommand value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WriteString("type", value.GetType().Name);
            
            // Сериализуем только нужные данные в зависимости от типа команды
            if (value is CreateTaskCommand createCmd)
            {
                // Используем рефлексию, чтобы получить приватное поле _taskDto
                var taskDtoField = createCmd.GetType().GetField("_taskDto", 
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                if (taskDtoField != null)
                {
                    var taskDto = taskDtoField.GetValue(createCmd) as TaskDto;
                    writer.WritePropertyName("taskDto");
                    JsonSerializer.Serialize(writer, taskDto, options);
                }
            }
            else if (value is UpdateTaskCommand updateCmd)
            {
                var taskDtoField = updateCmd.GetType().GetField("_taskDto", 
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                if (taskDtoField != null)
                {
                    var taskDto = taskDtoField.GetValue(updateCmd) as TaskDto;
                    writer.WritePropertyName("taskDto");
                    JsonSerializer.Serialize(writer, taskDto, options);
                }
            }
            else if (value is DeleteTaskCommand deleteCmd)
            {
                var taskIdField = deleteCmd.GetType().GetField("_taskId", 
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                if (taskIdField != null)
                {
                    var taskId = (int)taskIdField.GetValue(deleteCmd);
                    writer.WriteNumber("taskId", taskId);
                }
            }
            
            writer.WriteEndObject();
        }
    }
}