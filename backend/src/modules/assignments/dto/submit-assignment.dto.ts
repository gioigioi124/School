import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiProperty({
    description: 'Nội dung câu trả lời của học sinh (JSON hoặc chuỗi)',
    example: { answers: { q1: 'A', q2: 'B' } },
  })
  @IsNotEmpty()
  content: any;
}
