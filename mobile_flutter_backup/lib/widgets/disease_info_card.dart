import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/disease_info.dart';

class DiseaseInfoCard extends StatelessWidget {
  final String diseaseId;
  final double confidence;
  final bool isExpanded;

  const DiseaseInfoCard({
    super.key,
    required this.diseaseId,
    required this.confidence,
    this.isExpanded = false,
  });

  Color _parseColor(String colorHex) {
    try {
      return Color(int.parse(colorHex.replaceFirst('#', 'FF'), radix: 16));
    } catch (e) {
      return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final diseaseService = context.read<DiseaseInfoService>();
    final info = diseaseService.getInfo(diseaseId);
    final colorScheme = Theme.of(context).colorScheme;
    
    if (info == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text('Unknown condition: $diseaseId'),
      );
    }

    final diseaseColor = _parseColor(info.color);

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: diseaseColor.withOpacity(0.3), width: 2),
        boxShadow: [
          BoxShadow(
            color: diseaseColor.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header with name and confidence
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: diseaseColor.withOpacity(0.1),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: diseaseColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.medical_information,
                    color: diseaseColor,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        info.name,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Confidence: ${(confidence * 100).toStringAsFixed(1)}%',
                        style: TextStyle(
                          color: colorScheme.onSurfaceVariant,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                // Confidence ring
                SizedBox(
                  width: 56,
                  height: 56,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      CircularProgressIndicator(
                        value: confidence,
                        backgroundColor: colorScheme.surfaceContainerHighest,
                        valueColor: AlwaysStoppedAnimation(diseaseColor),
                        strokeWidth: 6,
                      ),
                      Text(
                        '${(confidence * 100).round()}%',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Description
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              info.description,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ),

          if (isExpanded) ...[
            const Divider(height: 1),
            
            // Symptoms
            _buildSection(
              context,
              icon: Icons.sick_outlined,
              title: 'Common Symptoms',
              items: info.symptoms,
              color: diseaseColor,
            ),

            const Divider(height: 1),

            // Treatment
            _buildSection(
              context,
              icon: Icons.healing_outlined,
              title: 'Treatment',
              items: info.treatment,
              color: diseaseColor,
            ),

            const Divider(height: 1),

            // When to see doctor
            _buildSection(
              context,
              icon: Icons.local_hospital_outlined,
              title: 'When to See a Doctor',
              items: info.whenToSeeDoctor,
              color: Colors.red,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required IconData icon,
    required String title,
    required List<String> items,
    required Color color,
  }) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: color),
              const SizedBox(width: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 6),
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
